"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error?: string;
  onRetry?: () => void;
}

const ErrorPage = ({ error = "Failed to fetch", onRetry }: ErrorPageProps) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Astronaut Illustration */}
      <div className="mb-8 text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          {/* Moon */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-purple-600 rounded-full opacity-80"></div>
          
          {/* Astronaut */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full">
            {/* Helmet */}
            <div className="absolute top-0 left-0 w-full h-full bg-white rounded-full border-2 border-gray-300"></div>
            {/* Visor */}
            <div className="absolute top-2 left-2 w-8 h-6 bg-pink-400 rounded-full opacity-80"></div>
          </div>
          
          {/* Tablet */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-black border-2 border-pink-400 rounded">
            <div className="w-full h-full bg-black rounded"></div>
          </div>
          
          {/* Space background */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute top-4 right-4 w-4 h-4 bg-purple-400 rounded-full opacity-60"></div>
            <div className="absolute top-8 left-8 w-2 h-2 bg-purple-300 rounded-full opacity-80"></div>
            <div className="absolute top-12 right-8 w-3 h-3 bg-purple-500 rounded-full opacity-70"></div>
          </div>
        </div>
      </div>

      {/* Error Text */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">
          Connect to the internet
        </h1>
        <p className="text-gray-400">
          {error}. Check your connection.
        </p>
      </div>

      {/* Retry Button */}
      <Button
        onClick={handleRetry}
        disabled={isRetrying}
        className="bg-transparent border border-gray-600 text-yellow-400 hover:bg-gray-800 hover:border-gray-500 rounded-lg px-6 py-2 transition-colors"
      >
        {isRetrying ? "Retrying..." : "Retry"}
      </Button>
    </div>
  );
};

export default ErrorPage;

