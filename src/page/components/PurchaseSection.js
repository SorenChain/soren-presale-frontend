import React, { useCallback, useState } from "react";
import PhaseInfo from "./PhaseInfo";
import PaymentOptions from "./PaymentOptions";
import AmountInput from "./AmountInput";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import ERC20 from "../../abis/ERC20.json";

const SOREN_TOKEN_ADDRESS = "0xD154b84E5e688bFd060e8e1898365a4F8582F3de";
const PRE_SALE_CONTRACT_ADDRESS = "0xF8B3aB0c0074871DD2b92652221253E8f9F546eE";

function PurchaseSection() {
  const [selectedOption, setSelectedOption] = useState("ETM");
  const [amount, setAmount] = useState(0);

  const { address, isConnected } = useAccount();

  const { writeContract } = useWriteContract();

  const currentApproval = useReadContract({
    address: SOREN_TOKEN_ADDRESS,
    abi: ERC20.abi,
    functionName: "allowance",
    args: [address, PRE_SALE_CONTRACT_ADDRESS],
  });

  const handleSelectedOption = (option) => {
    setSelectedOption(option);
  };

  const handleBuy = useCallback(() => {
    writeContract({
      abi: ERC20.abi,
      // TODO: Need to be replaced when production deployment
      // USDT Address
      address: "0x9B4D9Ab057f289592726924e1C1bF24F539AD7E9",
      functionName: "approve",
      args: [
        PRE_SALE_CONTRACT_ADDRESS,
        // To convert this into USDT Decimal value from user input
        amount * 10e6,
      ],
    });
  }, [amount]);

  console.debug({ currentApproval, amount });

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
          />
          <button className="connect-wallet-button" onClick={handleBuy}>
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseSection;
