import React from 'react'
import Wallet from "../assets/wallent.svg"
import Reception from "../assets/image1.svg"
import Purchase from "../assets/image2.svg"

const BuySorenCard = () => {
  return (
    <div>
      <div className="how-to-buy-soren-container">
        <h2 className="main-title">How to Buy <span>Soren</span></h2>
        <div className="container-custom">
          <div className='row'>
            <div className='col-lg-6 position-relative'>
              <div className="wallet-setup-card triangle-top-right triangle-bottom-right p-relative">
                <div className="content-box">
                  <h3 className="card-title">Wallet Setup <span role="img" aria-label="wallet"><img src={Wallet}/>
                    </span></h3>
                  <p className="card-description">
                    Welcome aboard! Start by getting MetaMask on your desktop browser or a WalletConnect-compatible wallet like Trust Wallet for your mobile.
                    Desktop users, MetaMask is ideal for a smooth purchase process. Mobile users, Trust Wallet or MetaMask connected through WalletConnect is your go-to.
                  </p>
                </div>
                <div className="step-box">
                  <div className="step-number">Step 1</div>
                </div>
                <div className="connector-line"></div>
              </div>
            </div>
            <div className='col-lg-6'></div>
            <div className='col-lg-6'></div>
            <div className='col-lg-6 d-flex justify-content-end'>
              <div className="wallet-setup-card-1 triangle-top-left triangle-bottom-left p-relative">
                <div className="content-box">
                  <h3 className="card-title">Purchase Process<span role="img" aria-label="wallet"><img src={Purchase}/></span></h3>
                  <p className="card-description">
                  Ready to invest? Simply pick your preferred currency on our site, input how many Soren tokens you'd like, and hit 'Buy Now'. A prompt will pop up from your wallet for transaction confirmation, where you’ll also see the gas fees.
                  Note: Purchasing with USDT/USDC may involve two approvals—one to okay the contract and another for the actual payment.
                  </p>
                </div>
                <div className="step-box-1">
                  <div className="step-number">Step 2</div>
                </div>
                <div className="connector-top"></div>
                <div className="connector-line-1"></div>
                <div className="connector-bottom"></div>
              </div>
            </div>
            <div className='col-lg-6'><div className="step-card step-3  me-auto">
              <div className="wallet-setup-card-3 triangle-top3-right triangle-bottom3-right p-relative">
                <div className="content-box">
                  <h3 className="card-title">Token Reception<span role="img" aria-label="wallet"><img src={Reception}/></span></h3>
                  <p className="card-description">
                  Once our presale wraps up, you can collect your Soren tokens through our website or wait for an airdrop straight to your wallet. Meanwhile, keep an eye on your investment and the token prices from your dashboard. Just connect your wallet to our website, and voilà—you’re there!
                  </p>
                </div>
                <div className="step-box-3">
                  <div className="step-number">Step 3</div>
                </div>
                <div className="connector-line-3"></div>
              </div>
            </div></div>
            <div className='col-lg-6'>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BuySorenCard