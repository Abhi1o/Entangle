"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ParaProvider
        paraClientConfig={{
          apiKey: process.env.NEXT_PUBLIC_PARA_API_KEY!, // Your API key
        }}
        config={{
          appName: "Your App Name",
        }}
        paraModalConfig={{
          // Enable Twitter OAuth
          oAuthMethods: ["TWITTER"],
          // Enable on-ramp in test mode (set to false for production)
          onRampTestMode: true,
          // Theme customization
          theme: {
            foregroundColor: "#333333",
            backgroundColor: "#FFFFFF",
            accentColor: "#1DA1F2", // Twitter blue
            mode: "light",
            borderRadius: "md",
          },
          // Enable recovery options
          recoverySecretStepEnabled: true,
          twoFactorAuthEnabled: false, // Optional
        }}
      >
        {children}
      </ParaProvider>
    </QueryClientProvider>
  );
}