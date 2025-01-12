"use client";

import React, { useState, useEffect } from "react";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import { Address } from "ton"; // TON SDK for address formatting

const HomePage = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [friendlyAddress, setFriendlyAddress] = useState<string | null>(null); // Friendly format
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    const handleStatusChange = () => {
      const wallet = tonConnectUI.wallet;
      if (wallet) {
        const rawAddress = wallet.account.address;
        setWalletAddress(rawAddress);

        // Convert raw address to friendly format
        const friendly = Address.parseRaw(rawAddress).toString();
        setFriendlyAddress(friendly);
      } else {
        setWalletAddress(null);
        setFriendlyAddress(null);
      }
    };

    tonConnectUI.onStatusChange(handleStatusChange);

    return () => {
      setWalletAddress(null);
      setFriendlyAddress(null);
    };
  }, [tonConnectUI]);

  const handlePayment = async () => {
    if (!walletAddress) {
      setPaymentStatus("Please connect your wallet first.");
      return;
    }

    setPaymentStatus("Processing your payment...");

    const transactionMetadata = {
      userId: "user_12345",
      wallet: walletAddress,
      purpose: "CSV Request",
      txnId: `txn_${Date.now()}`,
    };

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: "<YOUR_WALLET_ADDRESS>",
            amount: "100000000", // 0.1 TON in nanograms
            payload: JSON.stringify(transactionMetadata),
          },
        ],
      });
      setPaymentStatus("Payment successful! We are processing your request.");
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentStatus("Payment failed. Please try again.");
    }
  };

  const copyToClipboard = () => {
    if (friendlyAddress) {
      navigator.clipboard.writeText(friendlyAddress);
      alert("Copied to clipboard.");
    }
  };

  // Utility to shorten the friendly address
  const formatFriendlyAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.substring(0, 6)}...${address.substring(
        address.length - 6
      )}`;
    }
    return address;
  };

  return (
    <div className="container">
      <h1>Welcome to MyTonStats</h1>

      {friendlyAddress ? (
        <>
          <div className="walletSection">
            <h2>Connected Wallet</h2>
            <p
              className="walletAddress"
              onClick={copyToClipboard}
              title="Click to copy full address"
              style={{ cursor: "pointer" }}
            >
              {formatFriendlyAddress(friendlyAddress)}
            </p>
            <div className="actionButtons">
              <button
                className="disconnectButton"
                onClick={() => {
                  tonConnectUI.disconnect();
                  setWalletAddress(null);
                  setFriendlyAddress(null);
                }}
              >
                Disconnect
              </button>
            </div>
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
