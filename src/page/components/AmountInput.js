import React, { useCallback, useState } from "react";
import SorenIcon from "../assets/soren-icon.svg";
import UsdtIcon from "../assets/ETH.svg";
import UsdIcon from "../assets/USDT.svg";

function AmountInput({ selectedOption, amount, setAmount }) {
  const [sorenTokens, setSorenTokens] = useState(0);

  const getSelectedOptionIcon = useCallback(() => {
    if (selectedOption == "ETH") {
      return <img src={UsdtIcon} alt="ETH" className="crypto-icon" />;
    }
    return <img src={UsdIcon} alt="Soren" className="soren-icon-small" />;
  }, [selectedOption]);

  return (
    <div className="amount-input-step">
      <h3>
        Step 2: <span>Pay with card or pay with Crypto</span>
      </h3>
      <div className="amount-input-container">
        <div className="height_input">
          <input
            className="amount-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,20}$/.test(value)) {
                setAmount(value);
              }
            }}
            name="amount"
          />
          <div className="flex items-center justify-center">
            {getSelectedOptionIcon()}
            <span className="currency-label ms-2">{selectedOption}</span>
          </div>
        </div>
        <span className="equals-sign mx-4">=</span>
        <div className="height_input">
          <input
            className="amount-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={sorenTokens}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d{0,20}$/.test(value)) {
                setSorenTokens(value);
              }
            }}
            name="sorenTokens"
          />
          <div className="flex items-center justify-center">
            <img src={SorenIcon} alt="Soren" className="soren-icon-small" />
            <span className="currency-label ms-2">Soren</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AmountInput;
