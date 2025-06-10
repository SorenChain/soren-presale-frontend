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
import {
  PRE_SALE_CONTRACT_ADDRESS,
  PRE_SALE_ROUND_ID,
  USDT_TOKEN_ADDRESS,
  ETHER_BASE_DECIMAL,
} from "../../constants";
import ClaimSorenTokens from "../../components/ClaimSorenTokens";

function PurchaseSection() {
  const [selectedOption, setSelectedOption] = useState("POL");
  const [amount, setAmount] = useState();
  const [convertedSoren, setConvertedSoren] = useState(0);
  const { address, isConnected } = useAccount();
  const [destinationAddress, setDestinationAddress] = useState(address || "");
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
    args: [PRE_SALE_ROUND_ID],
  });

  const currentPreSaleRoundPrice =
    Number(preSaleRoundConfig?.data?.[3]) / ETHER_BASE_DECIMAL || 0;
  const totalTokens = Number(preSaleRoundConfig?.data?.[4]) || 0;
  const tokensRemaining = Number(preSaleRoundConfig?.data?.[6]) || 0;

  const currentPhaseEndDateTime = preSaleRoundConfig?.data?.[2] || Date.now();

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
        ? [PRE_SALE_ROUND_ID, (amount * 1_000_000).toString()]
        : undefined,
    query: { enabled: isUsdtOrUsd && amount > 0 },
  });

  const POLToSoren = useReadContract({
    address:
      selectedOption === "POL" && amount > 0
        ? PRE_SALE_CONTRACT_ADDRESS
        : undefined,
    abi: preSaleABI,
    functionName: "ethToTokenAmount",
    args:
      selectedOption === "POL" && amount > 0
        ? [PRE_SALE_ROUND_ID, (amount * ETHER_BASE_DECIMAL).toString()]
        : undefined,
    query: { enabled: selectedOption === "POL" && amount > 0 },
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
      selectedOption === "POL" && convertedSoren > 0
        ? PRE_SALE_CONTRACT_ADDRESS
        : undefined,
    abi: preSaleABI,
    functionName: "ethBuyHelper",
    args:
      selectedOption === "POL" && convertedSoren > 0
        ? [convertedSoren]
        : undefined,
    query: { enabled: selectedOption === "POL" && convertedSoren > 0 },
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
          const baseUrl = process.env.REACT_APP_BACKEND_URL || "https://api.gamimarket.io";
          const res = await fetch(`${baseUrl}/payment/verify-session?session_id=${sessionId}`,
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
    } else if (selectedOption === "POL" && POLToSoren?.data !== undefined) {
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
      } else if (selectedOption === "POL" && tokenToEth?.data) {
        console.debug({ newSorenValue, action: "setting value POL" });

        setAmount(
          (parseFloat(tokenToEth.data.toString()) / ETHER_BASE_DECIMAL).toFixed(
            6
          )
        );
      }
    },
    [selectedOption]
  );

  const handleSelectedOption = (option) => {
    setSelectedOption(option);
  };

  const handleBuy = useCallback(async () => {
    if (!amount || amount <= 0)
      return toast.error("Please enter valid amount.");

    if (selectedOption === "USD") {
      const baseUrl = process.env.REACT_APP_BACKEND_URL || "https://api.gamimarket.io";
      try {
        const res = await fetch(`${baseUrl}/payment/create-checkout-session`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: Math.round(amount * 100),
              address: destinationAddress || address,
              convertedSoren,
            }),
          }
        );

        const data = await res.json();
        const stripe = await stripePromise;
        await stripe?.redirectToCheckout({ sessionId: data.id });
        toast.success("Payment successful! Tokens will be processed.");
      } catch (err) {
        console.error("Stripe Checkout error:", err);
        toast.error("Payment redirect failed.");
      }
    } else {
      if (!address) return toast.error("Please connect with metamask");
      if (selectedOption === "USDT") {
        console.log("hello");
        console.log(currentApproval?.data);
        console.log(amount * 1_000_000);
        if (currentApproval?.data < amount * 1_000_000) {
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
            args: [PRE_SALE_ROUND_ID, convertedSoren.toString()],
          });
        }

        setTimeout(() => {
          currentApproval?.refetch?.();
        }, 4000);
      } else if (selectedOption === "POL") {
        try {
          console.log("POL buy logic not yet implemented");
          console.log(parseEther(amount.toString()), amount.toString());
          writeContract({
            abi: preSaleABI,
            address: PRE_SALE_CONTRACT_ADDRESS,
            functionName: "buyWithEth",
            args: [PRE_SALE_ROUND_ID],
            value: parseEther(amount),
            onError: (error) => {
              console.debug({ error: JSON.stringify(error) });
            },
            onSuccess: (data) => {
              console.debug({ data: JSON.stringify(data) });
            },
          });
          console.log("POL buy logic not yet implemented");
        } catch (error) {
          console.error("Error in POL buy:", JSON.stringify(error));
        }
      }
    }
  }, [amount, selectedOption, destinationAddress, address, convertedSoren]);

  const isPhaseEnded = Date.now() / 1000 > currentPhaseEndDateTime;
  if (isPhaseEnded) {
    return <ClaimSorenTokens />;
  }

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
