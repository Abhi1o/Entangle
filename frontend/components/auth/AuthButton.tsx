"use client";

import { Button } from "@/components/ui/button";
import { useModal, useLogout } from "@getpara/react-sdk";
import { toast } from "sonner";
import { useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

interface AuthButtonProps {
  className?: string;
}

const AuthButton = ({ className }: AuthButtonProps) => {
  const { openModal } = useModal();
  const { logout, isPending: isLoggingOut } = useLogout();
  const { isLoggedIn } = useAuth();

  const handleLoginClick = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    openModal();
  }, [openModal]);

  const handleLogout = useCallback(() => {
    try {
      logout(
        { clearPregenWallets: true },
        {
          onSuccess: () => {
            toast.success('Successfully logged out!');
            // Clear any cached data
            localStorage.clear();
            sessionStorage.clear();
            // Refresh the page to clear any remaining state
            window.location.reload();
          },
          onError: (error) => {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
          },
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  }, [logout]);

  if (isLoggedIn) {
    return (
      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        variant="ghost"
        className={`text-lblm hover:text-white transition-colors ${className || ''}`}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLoginClick}
      variant="ghost"
      className={`text-lblm hover:text-white transition-colors ${className || ''}`}
    >
      Login
    </Button>
  );
};

export default AuthButton;
