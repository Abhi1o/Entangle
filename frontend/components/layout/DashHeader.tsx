"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useModal, useAccount } from "@getpara/react-sdk";

import Container from "@/components/layout/container";

const DashHeader = () => {
  const { openModal } = useModal();
  const account = useAccount();
  
  const isLoggedIn = account.isConnected && account.embedded.wallets?.length && account.embedded.wallets.length > 0;

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      openModal();
    }
  };

  return (
    <div className="navbar-bg h-[80px] bg-surface-level4 border-b border-border-light rounded-b-[24px]">
      <Container className="h-full">
        <header className="flex items-center justify-between h-full">
          <div>
            <Link href="/">
              <Image
                src="/logos/hero_logo.svg"
                alt="Logo"
                width={30}
                height={30}
                className="h-10"
              />
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6 font-[700] font-sans text-high-emphasis">
            <Link
              href="#"
              className="text-lblm hover:text-white transition-colors"
            >
              Wallet
            </Link>
            <Link
              href="/market-place"
              className="text-lblm hover:text-white transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href={isLoggedIn ? "/dashboard" : "#"}
              onClick={handleDashboardClick}
              className="text-lblm hover:text-white transition-colors"
            >
              {isLoggedIn ? "Dashboard" : "Login"}
            </Link>
          </nav>
          <div className="md:hidden">
            {/* Mobile menu button would go here */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white bg-surface-level1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </Button>
          </div>
        </header>
      </Container>
    </div>
  );
};

export default DashHeader;
