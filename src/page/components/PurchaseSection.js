import React, { useCallback, useEffect, useState } from "react";
import PhaseInfo from "./PhaseInfo";
import PaymentOptions from "./PaymentOptions";
import AmountInput from "./AmountInput";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import ERC20 from "../../abis/ERC20.json";
import preSaleABI from "../../abis/presaleABI.json";

const SOREN_TOKEN_ADDRESS = "0x9B4D9Ab057f289592726924e1C1bF24F539AD7E9";
const PRE_SALE_CONTRACT_ADDRESS = "0xF8B3aB0c0074871DD2b92652221253E8f9F546eE";
const USDT_TOKEN_ADDRESS = "0x9B4D9Ab057f289592726924e1C1bF24F539AD7E9";

function PurchaseSection() {
  const [selectedOption, setSelectedOption] = useState("ETH");
  const [amount, setAmount] = useState(0);
  const [convertedSoren, setConvertedSoren] = useState(0);

  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const currentApproval = useReadContract({
    address: SOREN_TOKEN_ADDRESS,
    abi: ERC20.abi,
    functionName: "allowance",
    args: address ? [address, PRE_SALE_CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Forward conversion
  const usdtToSoren = useReadContract({
    address:
      selectedOption === "USDT" && amount > 0
        ? PRE_SALE_CONTRACT_ADDRESS
        : undefined,
    abi: preSaleABI,
    functionName: "usdtToTokenAmount",
    args:
      selectedOption === "USDT" && amount > 0
        ? [1, (amount * 1_000_000).toString()]
        : undefined,
    query: { enabled: selectedOption === "USDT" && amount > 0 },
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
      selectedOption === "USDT" && convertedSoren > 0
        ? PRE_SALE_CONTRACT_ADDRESS
        : undefined,
    abi: preSaleABI,
    functionName: "usdtBuyHelper",
    args:
      selectedOption === "USDT" && convertedSoren > 0
        ? [convertedSoren]
        : undefined,
    query: { enabled: selectedOption === "USDT" && convertedSoren > 0 },
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

  useEffect(() => {
    if (selectedOption === "USDT" && usdtToSoren?.data !== undefined) {
      setConvertedSoren(usdtToSoren.data.toString());
    } else if (selectedOption === "ETH" && POLToSoren?.data !== undefined) {
      setConvertedSoren(POLToSoren.data.toString());
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

      if (selectedOption === "USDT" && tokenToUsdt?.data) {
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

  const handleBuy = useCallback(() => {
    if (selectedOption === "USDT") {
      writeContract({
        abi: ERC20.abi,
        address: USDT_TOKEN_ADDRESS,
        functionName: "approve",
        args: [PRE_SALE_CONTRACT_ADDRESS, (amount * 1_000_000).toString()],
      });
      setTimeout(() => {
        currentApproval?.refetch?.();
      }, 4000);
    } else if (selectedOption === "ETH") {
      console.log("ETH buy logic not yet implemented");
    }
  }, [amount, selectedOption]);

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
          <PhaseInfo />
          <PaymentOptions
            selectedOption={selectedOption}
            handleSelectedOption={handleSelectedOption}
          />
          <AmountInput
            selectedOption={selectedOption}
            amount={amount}
            setAmount={setAmount}
            convertedSoren={convertedSoren}
            setConvertedSoren={handleSorenChange}
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
