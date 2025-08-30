"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ParaProvider } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { ClientOnly } from "./hydration-safe";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ClientOnly
        fallback={
          <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="mt-4 text-lg">Loading...</p>
            </div>
          </div>
        }
      >
        <ParaProvider
          paraClientConfig={{
            apiKey: process.env.NEXT_PUBLIC_PARA_API_KEY!, // Your API key
          }}
          config={{
            appName: "Entangle",
          }}
          paraModalConfig={{
            // Enable Twitter OAuth
            logo: "/assets/logos/hero_logo.svg",
            oAuthMethods: ["TWITTER"],
            // Enable on-ramp in test mode (set to false for production)
            onRampTestMode: true,
            disableEmailLogin: true,
            disablePhoneLogin: true,
            // Enhanced theme customization to match app's design with light borders and yellow accents
            theme: {
              foregroundColor: "#FFFFFF",
              backgroundColor: "#0A0A0A", // Deep black background
              accentColor: "#FFD700", // Golden yellow primary accent (like "Go to app" button)
              mode: "dark",
              borderRadius: "xl", // More rounded corners for modern look
              font: "var(--font-dm-sans), system-ui, sans-serif",
            },
            // Enhanced styling for better UX
            recoverySecretStepEnabled: true,
            twoFactorAuthEnabled: false,
          }}
        >
          {children}
        </ParaProvider>
      </ClientOnly>
    </QueryClientProvider>
  );
}