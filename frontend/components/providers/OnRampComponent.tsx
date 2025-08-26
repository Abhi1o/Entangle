"use client";

import { useState } from "react";
import { useModal } from "@getpara/react-sdk";

interface OnRampComponentProps {
  selectedNetwork: string;
  onComplete: () => void;
}

export default function OnRampComponent({ selectedNetwork, onComplete }: OnRampComponentProps) {
  const [amount, setAmount] = useState("100");
  const [isProcessing, setIsProcessing] = useState(false);
  const { openModal } = useModal();

  const handleBuyTokens = async () => {
    setIsProcessing(true);
    try {
      // Open Para's built-in funding modal
      await openModal();
      
      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("On-ramp error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Fund Your Wallet
      </h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-2">Selected Network:</p>
        <div className="bg-gray-100 rounded-lg p-3">
          <span className="font-medium">{selectedNetwork}</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount to Deposit (USD)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="10"
          max="10000"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter amount..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Minimum: $10, Maximum: $10,000
        </p>
      </div>

      <button
        onClick={handleBuyTokens}
        disabled={isProcessing || !amount || parseFloat(amount) < 10}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 
                 text-white font-semibold py-3 rounded-lg 
                 transition-colors duration-200"
      >
        {isProcessing ? "Processing..." : `Buy $${amount} Worth of Tokens`}
      </button>

      <button
        onClick={onComplete}
        className="w-full mt-3 bg-gray-200 hover:bg-gray-300 
                 text-gray-700 font-semibold py-3 rounded-lg 
                 transition-colors duration-200"
      >
        Skip for Now
      </button>
    </div>
  );
}