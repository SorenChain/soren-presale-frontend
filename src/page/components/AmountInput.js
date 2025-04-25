import React from 'react';
import SorenIcon from '../assets/soren-icon.svg';
import ETM from '../assets/ETM.svg';  // Assuming you have a Soren icon as SVG

function AmountInput() {
  return (
    <div className="amount-input-step">
      <h3>Step 2: <span>Pay with card or pay with Crypto</span></h3>
      <div className="amount-input-container">
        <div className='height_input'>
          <p className="amount-input" >1</p>
          <div>
            <img src={ETM} alt="Soren" className="soren-icon-small" />
            <span className="currency-label ms-2">ETM</span>
          </div>
        </div>
        <span className="equals-sign mx-4">=</span>
        <div className='height_input'>
        <p className="amount-input">0.1758000</p>
          <div>
            <img src={SorenIcon} alt="Soren" className="soren-icon-small" />
            <span className="currency-label ms-2">Soren</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AmountInput;