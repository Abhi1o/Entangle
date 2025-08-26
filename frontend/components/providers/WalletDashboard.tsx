"use client";

import { useState, useEffect } from "react";
import { useAccount, useLogout } from "@getpara/react-sdk";

export default function WalletDashboard() {
  const account = useAccount();
  const { logout, isPending: isLoggingOut } = useLogout();
  const [balances, setBalances] = useState<Record<string, string>>({});

  const wallet = account.embedded.wallets?.[0];
  const userInfo = account.embedded.userId;

  // Simulate balance fetching (replace with real API calls)
  useEffect(() => {
    if (wallet) {
      // Mock balances - replace with actual balance fetching
      setBalances({
        native: "0.125", // ETH, SOL, or ATOM depending on network
        usd: "245.80"
      });
    }
  }, [wallet]);

  const handleLogout = () => {
    logout(
      { clearPregenWallets: true },
      {
        onSuccess: () => {
          console.log("Logged out successfully");
          window.location.reload(); // Refresh the page
        },
        onError: (error) => {
          console.error("Logout failed:", error);
        },
      }
    );
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      alert("Address copied to clipboard!");
    }
  };

  if (!wallet || !userInfo) {
    return <div>Loading wallet...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">Welcome back!</h2>
            <p className="text-gray-600">
              {userInfo || "User"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 
                     text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Wallet Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Network</label>
            <p className="mt-1 text-lg font-mono">{wallet.type}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-mono bg-gray-100 p-2 rounded flex-1 break-all">
                {wallet.address}
              </p>
              <button
                onClick={copyAddress}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 
                         rounded text-sm transition-colors duration-200"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Balance</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 
                        text-white p-6 rounded-lg">
            <h4 className="text-lg font-medium">Total USD Value</h4>
            <p className="text-3xl font-bold">${balances.usd}</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-blue-500 
                        text-white p-6 rounded-lg">
            <h4 className="text-lg font-medium">
              {wallet.type === 'EVM' ? 'ETH' : 
               wallet.type === 'SOLANA' ? 'SOL' : 'ATOM'}
            </h4>
            <p className="text-3xl font-bold">{balances.native}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white 
                           py-3 px-4 rounded-lg transition-colors duration-200">
            Add Funds
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white 
                           py-3 px-4 rounded-lg transition-colors duration-200">
            Send Tokens
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white 
                           py-3 px-4 rounded-lg transition-colors duration-200">
            Transaction History
          </button>
        </div>
      </div>
    </div>
  );
}