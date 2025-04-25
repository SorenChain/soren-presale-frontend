import React from 'react';
import SorenIcon from '../assets/soren-icon.svg'; // Assuming you have a Soren icon as SVG

function PhaseInfo() {
  return (
    <div className="phase-info">
      <div className="price-info">
        <div className='price_info'>
        <div>
        <img src={SorenIcon} alt="Soren" className="soren-icon-small" />
        <span>1 Soren = $ 0.1758000</span>
        </div>
        <div className="next-phase-info">10% Increase on Next Phase</div>
        </div>
      </div>
      <div class="progress-container">
    <div class="progress-bar-background">
      <div class="progress-bar-fill"></div>
      <div class="progress-indicator">
        <img src={SorenIcon}/>
      </div>
    </div>
  </div>
      
    </div>
  );
}

export default PhaseInfo;