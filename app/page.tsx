"use client";

import React, { useState, useEffect } from "react";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";

const HomePage = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    const wallet = tonConnectUI.wallet;
    if (wallet) {
      setWalletAddress(wallet.account.address);
    }
  }, [tonConnectUI]);

  const handlePayment = async () => {
    if (!walletAddress) {
      setPaymentStatus("Please connect your wallet first.");
      return;
    }

    setPaymentStatus("Processing your payment...");

    const transactionMetadata = {
      userId: "user_12345", // Replace with dynamic user ID
      wallet: walletAddress,
      purpose: "CSV Request",
      txnId: `txn_${Date.now()}`,
    };

    try {
      // Send transaction using the correct structure
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now
        messages: [
          {
            address: "<YOUR_WALLET_ADDRESS>", // Replace with your receiving wallet address
            amount: "100000000", // 0.1 TON in nanograms
            payload: JSON.stringify(transactionMetadata), // Metadata as payload
          },
        ],
      });
      setPaymentStatus("Payment successful! We are processing your request.");
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentStatus("Payment failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Welcome to MyTonStats</h1>

      {walletAddress ? (
        <>
          <div className="walletSection">
            <h2>Connected Wallet</h2>
            <p className="walletAddress">{walletAddress}</p>
            <button
              className="disconnectButton"
              onClick={() => tonConnectUI.disconnect()}
            >
              Disconnect
            </button>
          </div>

          <div className="paymentSection">
            <h2>Generate Your CSV File</h2>
            <p>
              Pay <strong>0.1 TON</strong> to process your request.
            </p>
            <button className="paymentButton" onClick={handlePayment}>
              Pay 0.1 TON
            </button>
            {paymentStatus && <p className="paymentStatus">{paymentStatus}</p>}
          </div>
        </>
      ) : (
        <div className="buttonWrapper">
          <TonConnectButton />
        </div>
      )}
    </div>
  );
};

export default HomePage;
