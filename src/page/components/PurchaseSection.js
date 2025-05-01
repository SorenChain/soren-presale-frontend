import React, { useCallback, useEffect, useState } from "react";
import PhaseInfo from "./PhaseInfo";
import PaymentOptions from "./PaymentOptions";
import AmountInput from "./AmountInput";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import ERC20 from "../../abis/ERC20.json";
import preSaleABI from "../../abis/presaleABI.json";
import { stripePromise } from "../../config/stripe";
import { toast } from "react-toastify";
import { parseEther } from "viem";
import { ethers } from "ethers";

const PRE_SALE_CONTRACT_ADDRESS = "0x6BB10506788e7f0deE2b7d6660fAec0EA9C1EB25";
const USDT_TOKEN_ADDRESS = "0x9B4D9Ab057f289592726924e1C1bF24F539AD7E9";

function PurchaseSection() {
  const [selectedOption, setSelectedOption] = useState("ETH");
  const [amount, setAmount] = useState();
  const [convertedSoren, setConvertedSoren] = useState(0);
  const { address, isConnected } = useAccount();
  const [destinationAddress, setDestinationAddress] = useState(address || "");

  // const provider = new ethers.getDefaultProvider(
  //   "https://polygon-amoy.infura.io/v3/bc3eae3a78c14edfa723a8c8b2548f61"
  // );
  // const privateKeyAdmin = 'a4460f03c8047236a0067fadc308709a28d91b26eda79786384c78e157d5a24e';
  // const adminSigner = new ethers.Wallet(privateKeyAdmin, provider);

  const { writeContract } = useWriteContract();

  const isUsdtOrUsd = ["USDT", "USD"].includes(selectedOption);

  useEffect(() => {
    setDestinationAddress(address || "");
  }, [address]);
  // Pre-sale round values
  const preSaleRoundConfig = useReadContract({
    address: PRE_SALE_CONTRACT_ADDRESS,
    abi: preSaleABI,
    functionName: "presale",
    // TODO: to be fetched from env
    args: [1],
  });

  const currentPreSaleRoundPrice =
    Number(preSaleRoundConfig?.data?.[3]) / 1e18 || 0;
  const totalTokens = Number("100000000000000000000");
  const tokensRemaining = Number("67000000000000000000");
  const currentPhaseEndDateTime = 1746100062;

  console.debug({ preSaleRoundConfig, currentPreSaleRoundPrice });

  const currentApproval = useReadContract({
    address: USDT_TOKEN_ADDRESS,
    abi: ERC20.abi,
    functionName: "allowance",
    args: address ? [address, PRE_SALE_CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Forward conversion
  const usdtToSoren = useReadContract({
    address: isUsdtOrUsd && amount > 0 ? PRE_SALE_CONTRACT_ADDRESS : undefined,
    abi: preSaleABI,
    functionName: "usdtToTokenAmount",
    args:
      isUsdtOrUsd && amount > 0
        ? [1, (amount * 1_000_000).toString()]
        : undefined,
    query: { enabled: isUsdtOrUsd && amount > 0 },
  });

  const POLToSoren = useReadContract({
    address:
      selectedOption === "ETH" && amount > 0
        ? PRE_SALE_CONTRACT_ADDRESS
        : undefined,
    abi: preSaleABI,
    functionName: "ethToTokenAmount",
    args:
      selectedOption === "ETH" && amount > 0
        ? [1, (amount * 1e18).toString()]
        : undefined,
    query: { enabled: selectedOption === "ETH" && amount > 0 },
  });

  // Reverse conversion
  const tokenToUsdt = useReadContract({
    address:
      isUsdtOrUsd && convertedSoren > 0 ? PRE_SALE_CONTRACT_ADDRESS : undefined,
    abi: preSaleABI,
    functionName: "usdtBuyHelper",
    args: isUsdtOrUsd && convertedSoren > 0 ? [convertedSoren] : undefined,
    query: {
      enabled: isUsdtOrUsd && convertedSoren > 0,
    },
  });

  const tokenToEth = useReadContract({
    address:
      selectedOption === "ETH" && convertedSoren > 0
        ? PRE_SALE_CONTRACT_ADDRESS
        : undefined,
    abi: preSaleABI,
    functionName: "ethBuyHelper",
    args:
      selectedOption === "ETH" && convertedSoren > 0
        ? [convertedSoren]
        : undefined,
    query: { enabled: selectedOption === "ETH" && convertedSoren > 0 },
  });

  // TO handle the toast for success and cancel checkout page
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const sessionId = urlParams.get("session_id");

    if (!status) return;

    const verifyPayment = async () => {
      if (status === "success" && sessionId) {
        toast.loading("Verifying payment...");

        try {
          const res = await fetch(
            `https://3b93-2404-7c80-5c-70f8-8f25-1ddb-3ee8-4afa.ngrok-free.app/payment/verify-session?session_id=${sessionId}`,
            {
              method: "POST",
            }
          );
          const data = await res.json();
          toast.dismiss();

          if (data.error === "Invalid session_id") {
            // Optional toast: comment/uncomment below based on UX preference
            // toast.error("Invalid session ID.");
            return;
          }

          if (data.status === "paid") {
            toast.success("Payment confirmed! Tokens will be processed.");
          } else {
            toast.error(`Payment status: ${data.status}`);
          }
        } catch (err) {
          toast.dismiss();
          // Optional toast for fetch error
          // toast.error("Payment verification failed.");
        }
      } else if (status === "cancel") {
        toast.error("Payment was cancelled.");
      }

      // Cleanup the URL
      setTimeout(() => {
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }, 2000);
    };

    verifyPayment();
  }, []);

  useEffect(() => {
    if (selectedOption === "USDT" && usdtToSoren?.data !== undefined) {
      setConvertedSoren(usdtToSoren.data.toString());
    } else if (selectedOption === "ETH" && POLToSoren?.data !== undefined) {
      setConvertedSoren(POLToSoren.data.toString());
    } else if (selectedOption === "USD" && usdtToSoren?.data !== undefined) {
      setConvertedSoren(usdtToSoren.data.toString());
    } else {
      setConvertedSoren("");
    }
  }, [selectedOption, usdtToSoren?.data, POLToSoren?.data]);

  const handleSorenChange = useCallback(
    (newSorenValue) => {
      setConvertedSoren(newSorenValue);
      console.debug({ newSorenValue });

      if (!newSorenValue || isNaN(newSorenValue)) {
        setAmount(0);
        console.debug({ newSorenValue, action: "setting value 0" });

        return;
      }

      if (isUsdtOrUsd && tokenToUsdt?.data) {
        console.debug({ newSorenValue, action: "setting value USDT" });

        setAmount(
          (parseFloat(tokenToUsdt.data.toString()) / 1_000_000).toFixed(2)
        );
      } else if (selectedOption === "ETH" && tokenToEth?.data) {
        console.debug({ newSorenValue, action: "setting value ETH" });

        setAmount((parseFloat(tokenToEth.data.toString()) / 1e18).toFixed(6));
      }
    },
    [selectedOption]
  );

  const handleSelectedOption = (option) => {
    setSelectedOption(option);
  };

  const handleBuy = useCallback(async () => {
    if (!amount > 0) return toast.error("Please enter valid amount.");

    if (selectedOption === "USD") {
      try {
        const res = await fetch(
          "https://3b93-2404-7c80-5c-70f8-8f25-1ddb-3ee8-4afa.ngrok-free.app/payment/create-checkout-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: Math.round(amount * 100),
              address: destinationAddress || address,
            }),
          }
        );

        const data = await res.json();
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId: data.id });
        // const presaleContractInstance = new ethers.Contract(
        //   PRE_SALE_CONTRACT_ADDRESS,
        //   preSaleABI,
        //   adminSigner
        // );
        // const tx = await presaleContractInstance.buyWithFiat(
        //   buyerAddress,
        //   id,
        //   amount
        // );
        // await tx.wait();
        // console.log("Transaction hash:", tx.hash);
        // console.log("Transaction confirmed!");
        toast.success("Payment successful! Tokens will be processed.");
      } catch (err) {
        console.error("Stripe Checkout error:", err);
        toast.error("Payment redirect failed.");
      }
    } else {
      if (!address) return toast.error("Please connect with metamask");
      if (selectedOption === "USDT") {
        if (!(currentApproval?.data <= amount * 1_000_000)) {
          console.log(currentApproval?.data);
          toast.error("Please approve USDT first.");
          writeContract({
            abi: ERC20.abi,
            address: USDT_TOKEN_ADDRESS,
            functionName: "approve",
            args: [PRE_SALE_CONTRACT_ADDRESS, (amount * 1_000_000).toString()],
          });
        } else {
          toast.info("Buying tokens...");
          writeContract({
            abi: preSaleABI,
            address: PRE_SALE_CONTRACT_ADDRESS,
            functionName: "buyWithUSDT",
            args: ["1", convertedSoren.toString()],
          });
        }

        setTimeout(() => {
          currentApproval?.refetch?.();
        }, 4000);
      } else if (selectedOption === "ETH") {
        try {
          console.log("ETH buy logic not yet implemented");
          console.log(parseEther(amount.toString()), amount.toString());
          writeContract({
            abi: preSaleABI,
            address: PRE_SALE_CONTRACT_ADDRESS,
            functionName: "buyWithEth",
            args: [1],
            value: parseEther(amount),
            onError: (error) => {
              console.debug({ error: JSON.stringify(error) });
            },
            onSuccess: (data) => {
              console.debug({ data: JSON.stringify(data) });
            },
          });
          console.log("ETH buy logic not yet implemented");
        } catch (error) {
          console.error("Error in ETH buy:", JSON.stringify(error));
        }
      }
    }
  }, [amount, selectedOption, destinationAddress, address]);

  return (
    <div className="purchase-sectionbg">
      <div className="purchase-section">
        <div
          className="container p-4"
          style={{
            border: "1px solid #542ACC",
            borderRadius: "20px",
            backgroundColor: "#191924",
          }}
        >
          <PhaseInfo
            currentPreSaleRoundPrice={currentPreSaleRoundPrice}
            endDate={currentPhaseEndDateTime}
            totalTokens={totalTokens}
            tokensRemaining={tokensRemaining}
          />
          <PaymentOptions
            selectedOption={selectedOption}
            handleSelectedOption={handleSelectedOption}
          />
          <AmountInput
            isConnected={isConnected}
            selectedOption={selectedOption}
            amount={amount}
            setAmount={setAmount}
            convertedSoren={convertedSoren}
            setConvertedSoren={handleSorenChange}
            destinationAddress={destinationAddress}
            setDestinationAddress={setDestinationAddress}
          />
          {convertedSoren && (
            <div style={{ color: "white", marginTop: "10px" }}>
              You will receive: {convertedSoren} Soren Tokens
            </div>
          )}
          <button className="connect-wallet-button" onClick={handleBuy}>
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseSection;
