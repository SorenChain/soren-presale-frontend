import React, { useEffect, useState } from "react";
import SorenIcon from "../assets/soren-icon.svg";

function PhaseInfo({
  currentPreSaleRoundPrice,
  endDate,
  totalTokens,
  tokensRemaining,
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (!endDate) return;

    const end = Number(endDate);
    if (isNaN(end)) {
      setTimeLeft("Invalid end date");
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const secondsLeft = end - now;

      if (secondsLeft <= 0) {
        setTimeLeft("00:00:00");
        return;
      }

      const days = Math.floor(secondsLeft / (3600 * 24));
      const hours = Math.floor((secondsLeft % (3600 * 24)) / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;

      const formatted = `${days > 0 ? `${days}d ` : ""}${String(hours).padStart(
        2,
        "0"
      )}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0"
      )}`;

      setTimeLeft(formatted);
    };

    updateTimer(); // initial run
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  useEffect(() => {
    if (totalTokens && tokensRemaining) {
      // Calculate the progress percentage
      const total = Number(totalTokens);
      const remaining = Number(tokensRemaining);

      if (total === 0) {
        setProgressPercent(0);
      } else {
        // Progress calculation using BigInt
        const consumed = total - remaining;
        const percentage = (consumed / total) * 100;
        setProgressPercent(percentage);
      }
    }
  }, [totalTokens, tokensRemaining]);

  return (
    <div className="phase-info">
      <div className="price-info">
        <div className="price_info">
          <div>
            <img src={SorenIcon} alt="Soren" className="soren-icon-small" />
            <span>1 Soren = ${currentPreSaleRoundPrice}</span>
          </div>
          {/* Timer Display */}
          <div className="time-left">
            ⏳Current phase ends in: <strong>{timeLeft}</strong>
          </div>
          <div className="next-phase-info">10% Increase on Next Phase</div>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar-background">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          ></div>
          <div
            className="progress-indicator"
            style={{ left: `${progressPercent}%` }}
          >
            <img src={SorenIcon} alt="soren" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhaseInfo;
