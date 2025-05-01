import React, { useState } from "react";
import EthereumIcon from "../assets/soren-icon.svg";
import UsdtIcon from "../assets/ETH.svg";
import UsdIcon from "../assets/USDT.svg";
import CardImage from "../assets/card.svg";

function PaymentOptions({ selectedOption, handleSelectedOption }) {
  return (
    <div className="payment-options">
      <div className="payment-step">
        <h3>
          Step 1: <span>Pay with card or pay with Crypto</span>
        </h3>

        <div className="payment-methods">
          <div className="crypto-options">
            <p>Pay with Crypto</p>

            <div className="crypto-buttons">
              <button
                className={`crypto-button ${
                  selectedOption === "ETH" ? "active" : ""
                }`}
                onClick={() => handleSelectedOption("ETH")}
              >
                <img src={UsdtIcon} alt="ETH" className="crypto-icon" />
                <br />
                <span>ETH</span>
              </button>

              <button
                className={`crypto-button ${
                  selectedOption === "USDT" ? "active" : ""
                }`}
                onClick={() => handleSelectedOption("USDT")}
              >
                <img src={UsdIcon} alt="USDT" className="crypto-icon" />
                <br />
                <span>USDT</span>
              </button>

              {/* <button
                className={`crypto-button ${
                  selectedOption === "USD" ? "active" : ""
                }`}
                onClick={() => handleSelectedOption("USD")}
              >
                <img src={UsdIcon} alt="USD" className="crypto-icon" />
                <br />
                <span>USD</span>
              </button> */}
            </div>
          </div>

          <div className="or-separator">OR</div>

          <div className="card-option active">
            <p>Pay with card</p>
            <div
              className={`card-info crypto-button ${
                selectedOption === "USD" ? "active" : ""
              }`}
              onClick={() => handleSelectedOption("USD")}
            >
              <img src={CardImage} alt="Card" className="card-image" />
              <span>
                <strong>Card</strong>
                <br />
                Visa, Master Card etc
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentOptions;
