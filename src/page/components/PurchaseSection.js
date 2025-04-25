import React from 'react';
import PhaseInfo from './PhaseInfo';
import PaymentOptions from './PaymentOptions';
import AmountInput from './AmountInput';

function PurchaseSection() {
  return (
    <div className='purchase-sectionbg'>
      <div className="purchase-section">
        <div className='container p-4' style={{border:"1px solid #542ACC", borderRadius:"20px", backgroundColor:"#191924"}}>
          <PhaseInfo />
          <PaymentOptions />
          <AmountInput />
          <button className="connect-wallet-button">
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseSection;