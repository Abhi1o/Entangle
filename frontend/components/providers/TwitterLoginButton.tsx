"use client";

import { useRef } from "react";
import { useVerifyOAuth } from "@getpara/react-sdk";

interface TwitterLoginButtonProps {
  onSuccess: () => void;
}

export default function TwitterLoginButton({ onSuccess }: TwitterLoginButtonProps) {
  const popupWindow = useRef<Window | null>(null);
  const { verifyOAuth, isPending } = useVerifyOAuth();

  const handleTwitterLogin = () => {
    verifyOAuth(
      {
        method: "TWITTER",
        onOAuthPopup: (popup) => {
          popupWindow.current = popup;
        },
        isCanceled: () => popupWindow.current?.closed || false,
        onCancel: () => {
          console.log("Twitter login cancelled");
        },
      },
      {
        onSuccess: (authState) => {
          console.log("Twitter login successful:", authState);
          onSuccess();
        },
        onError: (error) => {
          console.error("Twitter login failed:", error);
          alert("Twitter login failed. Please try again.");
        },
      }
    );
  };

  return (
    <button
      onClick={handleTwitterLogin}
      disabled={isPending}
      className="bg-[#1DA1F2] hover:bg-[#1a91da] disabled:opacity-50 
                 text-white font-semibold py-3 px-8 rounded-lg 
                 transition-colors duration-200 flex items-center gap-3 mx-auto"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
      {isPending ? "Connecting..." : "Login with Twitter"}
    </button>
  );
}