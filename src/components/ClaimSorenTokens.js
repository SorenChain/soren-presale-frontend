import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { toast } from "react-toastify";

import { ETHER_BASE_DECIMAL, PRE_SALE_CONTRACT_ADDRESS, PRE_SALE_ROUND_ID } from "../constants";
import preSaleABI from "../abis/presaleABI.json";

const ClaimSorenTokens = () => {
  const [claimableAmount, setClaimableAmount] = useState("0");
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  // Pre-sale round values
  const claimableAmountConfig = useReadContract({
    address: PRE_SALE_CONTRACT_ADDRESS,
    abi: preSaleABI,
    functionName: "claimableAmount",
    args: [address, PRE_SALE_ROUND_ID],
  });

  console.debug({ claimableAmountConfig, claimAmount: claimableAmountConfig.data  });

  // TODO: Replace with actual contract call to fetch claimable amount
  useEffect(() => {
    if (address) {
      setClaimableAmount(Number(claimableAmountConfig.data)/ETHER_BASE_DECIMAL || "0");
    }
  }, [address, claimableAmountConfig]);

  const handleClaim = () => {
    // Replace with actual claim logic
    if (!address) return toast.error("Please connect your wallet");
    toast.info("Claiming tokens...");
    writeContract({
      address: PRE_SALE_CONTRACT_ADDRESS,
      abi: preSaleABI,
      functionName: "claim",
      args: [address, PRE_SALE_ROUND_ID],
    });
  };

  return (
    <div
      className="border rounded p-4 !bg-black !text-white text-center"
      style={{ backgroundColor: "grey" }}
    >
      <h2 className="text-xl font-semibold mb-2">Claim Your Soren Tokens</h2>
      <p className="mb-4">
        You have <strong>{claimableAmount}</strong> SOREN tokens to claim.
      </p>
      <button
        onClick={handleClaim}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        style={{ backgroundColor: "#00ffc075" }}
      >
        Claim Tokens
      </button>
    </div>
  );
};

export default ClaimSorenTokens;
