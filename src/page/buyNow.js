import React, { useState } from "react";
import PurchaseSection from "./components/PurchaseSection";
import BuySorenCard from "./components/buySoren";
import Logo from "../page/assets/logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
// import "./BuySoren.scss";

const BuySoren = () => {
  const [amount, setAmount] = useState(1);
  const sorenRate = 0.1758;

  return (
    <div className="buy-soren-container">
      <div className="navbarC">
        <div className=" navbar">
          <div className="navbar-left">
            <img src={Logo} alt="POL" />
          </div>
          <div className="d-flex align-items-center ">
            {/* <a href="#" className="nav-link">Home</a>
                        <a href="#" className="nav-link buy-now">Buy Now</a> */}
          </div>
          <div className="navbar-right">
              <ConnectButton  className="connect-wallet-button my-0" />
            {/* <button className="connect-wallet-button my-0">
              {" "}
            </button> */}
          </div>
        </div>
      </div>

      <PurchaseSection />
      <BuySorenCard />
      <footer className="text-center">
        <p>c 2025 Soren | All rights reserved</p>
      </footer>
    </div>
  );
};

export default BuySoren;
