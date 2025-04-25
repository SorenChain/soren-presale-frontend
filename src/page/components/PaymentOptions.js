import React from 'react';
import EthereumIcon from '../assets/soren-icon.svg'; // Assuming you have these icons as SVGs
import UsdtIcon from '../assets/ETM.svg';
import UsdIcon from '../assets/USDT.svg';
import CardImage from '../assets/card.svg'; // Assuming you have a card image

function PaymentOptions() {
  return (
    <div className="payment-options">
      <div className="payment-step">
        <h3>Step 1: <span>Pay with card or pay with Crypto</span></h3>
        <div className="payment-methods">
          <div className="crypto-options">
            <p >Pay with Crypto</p>
            <div className="crypto-buttons">
              <button className="crypto-button">
              <img src={UsdtIcon} alt="USDT" className="crypto-icon" /><br></br>
                <span>ETM</span>
              </button>
              <button className="crypto-button active">
              <img src={UsdIcon} alt="USD" className="crypto-icon" /><br></br>
                <span>USDT</span>
              </button>
              <button className="crypto-button">
                <img src={UsdIcon} alt="USD" className="crypto-icon" /><br></br>
                <span>USD</span>
              </button>
            </div>
          </div>
          <div className="or-separator">OR</div>
         
          <div className="card-option">
          <p>Pay with card</p>
            <div className="card-info">
              <img src={CardImage} alt="Card" className="card-image" />
              <span><strong>Card</strong><br />Visa, Master Card etc</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentOptions;