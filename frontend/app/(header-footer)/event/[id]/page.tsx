"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

import { Check, Cross, CrossIcon, Share2, Trash, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";

import Container from "@/components/layout/container";
import TrendingCard from "@/components/cards/trending-card";
import DivTable from "@/components/shared/div-table";
import TextHeading from "@/components/shared/TextHeading";

const transactionTableData = {
  columns: ["Buyer", "Date", "Time", "Price (in USD)"],

  rows: [
    ["0xabcd...wxyz", "01 January 2025", "21:00", "9,999"],
    ["0xabcd...wxyz", "01 January 2025", "21:00", "9,999"],
  ],
};

const eventDetail = {
  profileImage: "/home-page/person.png",
  name: "Isabella Ray",
  username: "isabellar",
  title: "AI Hackathon",
  date: "10th April 2025",
  time: "09:00 - 18:00 GMT",
  floorPrice: "2.2 ETH",
  currentBid: "2.9 ETH",
};

// Simple modal component for minting process
interface MintingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CancelEventModalProps {
  isOpen: boolean;
  onClose: () => void;
};

type MintStatus = "loading" | "success" | "error";
type CancelStatus = "confirm" | "loading" | "success" | "error";

const MintingModal = ({ isOpen, onClose }: MintingModalProps) => {
  const [status, setStatus] = useState<MintStatus>("loading");

  // Reset status when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus("loading");

      // Simulate API call
      const timer = setTimeout(() => {
        // 80% success rate
        const isSuccess = Math.random() < 0.8;
        setStatus(isSuccess ? "success" : "error");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle retry
  const handleRetry = () => {
    setStatus("loading");

    // Simulate API call again
    const timer = setTimeout(() => {
      const isSuccess = Math.random() < 0.8;
      setStatus(isSuccess ? "success" : "error");
    }, 3000);

    return () => clearTimeout(timer);
  };

  if (!isOpen) return null;

  // Simple modal implementation using fixed positioning
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-10 bg-[var(--srf-l2,hsla(0,0%,11%,0.9))] border-light max-w-md mx-auto rounded-[24px] p-8 space-y-6">
        {/* Icon and Title */}
        <div className="flex flex-col items-center text-center space-y-4">
          {status === "loading" ? (
            <Image
              src="/assets/hour_glass.png"
              alt="Loading"
              width={100}
              height={100}
            />
          ) : status === "success" ? (
            <div className="h-24 w-24 bg-action-primary rounded-full" />
          ) : (
            <div className="h-24 w-24 bg-action-primary rounded-full" />
          )}

          <h2 className="text-2xl font-semibold text-white">
            {status === "loading"
              ? "Minting this NFT"
              : status === "success"
              ? "Meeting Minted!"
              : "Oops!"}
          </h2>

          <p className="text-medium-emphasis text-center">
            {status === "loading"
              ? "Please wait while we mint your NFT."
              : status === "success"
              ? "You can check out the event details and joining link in your dashboard"
              : "Something went wrong, try this again."}
          </p>
        </div>
      </div>
    </div>
  );
};

// Custom bidding component with built-in status handling
type BidStatus = "idle" | "loading" | "success" | "error";

const BiddingComponent = () => {
  const [bidAmount, setBidAmount] = useState("");
  const [status, setStatus] = useState<BidStatus>("idle");
  const [currentBid, setCurrentBid] = useState("345 USD");

  // Handle submitting a bid
  const handleSubmitBid = () => {
    // Set loading state
    setStatus("loading");

    // Simulate processing
    const timer = setTimeout(() => {
      // 80% success rate
      const isSuccess = Math.random() < 0.8;
      setStatus(isSuccess ? "success" : "error");

      // Update current bid on success
      if (isSuccess && bidAmount) {
        setCurrentBid(`${bidAmount} USD`);
      }
    }, 3000);

    return () => clearTimeout(timer);
  };

  // Handle closing the modal
  const handleClose = () => {
    setStatus("idle");
    setBidAmount("");
  };

  // Handle retry on error
  const handleRetry = () => {
    setStatus("loading");

    // Simulate processing again
    const timer = setTimeout(() => {
      const isSuccess = Math.random() < 0.8;
      setStatus(isSuccess ? "success" : "error");

      // Update current bid on success
      if (isSuccess && bidAmount) {
        setCurrentBid(`${bidAmount} USD`);
      }
    }, 3000);

    return () => clearTimeout(timer);
  };

  // If we're in a loading/success/error state, show the status modal
  if (status !== "idle") {
    return (
      <div className="bg-[#151515] rounded-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center text-center space-y-6 font-sans">
          {/* Status Icon */}
          {status === "loading" ? (
            <Image
              src="/assets/hour_glass.png"
              alt="Loading"
              width={100}
              height={100}
            />
          ) : status === "success" ? (
            <div className="h-24 w-24 bg-action-primary rounded-full" />
          ) : (
            <div className="h-24 w-24 bg-action-primary rounded-full" />
          )}

          {/* Title */}
          <h2 className="text-2xl font-semibold text-white">
            {status === "loading"
              ? "Please wait"
              : status === "success"
              ? "Your bid was placed!"
              : "Oops!"}
          </h2>

          {/* Description */}
          <p className="text-medium-emphasis text-center">
            {status === "loading"
              ? "Waiting for on-chain confirmation"
              : status === "success"
              ? "Check your dashboard for further notifications and to sync to your calendar."
              : "Something went wrong. You should probably redo your last actions."}
          </p>
        </div>
      </div>
    );
  }

  // Otherwise show the bidding form
  return (
    <div className="bg-[#151515] rounded-lg p-6 w-full font-sans">
      <h2 className="text-white text-xl font-medium mb-4">Place a bid</h2>

      <div className="flex gap-6">
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-1">CURRENT BID</p>
          <p className="text-white text-3xl font-bold">{currentBid}</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col">
            <p className="text-gray-400 text-sm mb-2">AMOUNT *</p>
            <FormInput
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Place a higher bid"
              className="bg-transparent"
            />
          </div>

          <FormButton
            className="float-right"
            onClick={handleSubmitBid}
            disabled={
              !bidAmount ||
              parseInt(bidAmount) <= parseInt(currentBid.split(" ")[0])
            }
          >
            Submit a bid
          </FormButton>
        </div>
      </div>
    </div>
  );
};

// Cancel Event Modal Component
const CancelEventModal = ({ isOpen, onClose }: CancelEventModalProps) => {
  const [status, setStatus] = useState<CancelStatus>("confirm");

  // Handle cancel confirmation
  const handleConfirmCancel = () => {
    setStatus("loading");

    // Simulate API call
    const timer = setTimeout(() => {
      // 80% success rate
      const isSuccess = Math.random() < 0.8;
      setStatus(isSuccess ? "success" : "error");
    }, 3000);

    return () => clearTimeout(timer);
  };

  // Handle retry
  const handleRetry = () => {
    setStatus("loading");

    // Simulate API call again
    const timer = setTimeout(() => {
      const isSuccess = Math.random() < 0.8;
      setStatus(isSuccess ? "success" : "error");
    }, 3000);

    return () => clearTimeout(timer);
  };

  // Reset status when modal closes
  const handleClose = () => {
    // Wait a bit before resetting status to avoid visual glitches
    setTimeout(() => {
      setStatus("confirm");
    }, 300);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={status === "confirm" ? handleClose : undefined} />

      {/* Modal Content */}
      <div className="relative z-10 bg-[var(--srf-l2,hsla(0,0%,11%,0.9))] border-light max-w-md mx-auto rounded-[24px] p-8 space-y-6">
        {/* cross close */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white absolute top-4 right-4 hover:bg-transparent"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex flex-col items-center text-center space-y-6 font-sans">
          {/* Icon/Status */}
          {status === "loading" ? (
            <Image
              src="/assets/hour_glass.png"
              alt="Loading"
              width={100}
              height={100}
            />
          ) : status === "success" ? (
            <div className="h-24 w-24 bg-action-primary rounded-full" />
          ) : status === "error" ? (
            <div className="h-24 w-24 bg-action-primary rounded-full" />
          ) : status === "confirm" ? (
            <div className="h-24 w-24 bg-action-primary rounded-full" />
          ) : null}

          {/* Title */}
          <h2 className="text-2xl font-semibold text-white">
            {status === "confirm"
              ? "Cancel this event?"
              : status === "loading"
              ? "Cancelling event"
              : status === "success"
              ? "Event Cancelled!"
              : "Oops!"}
          </h2>

          {/* Description */}
          <p className="text-medium-emphasis text-center">
            {status === "confirm"
              ? "This will make this event unavailable"
              : status === "loading"
              ? "Please wait while we process your request."
              : status === "success"
              ? "Your event has been cancelled and is no longer available."
              : "Something went wrong, please try again."}
          </p>

          {/* Action Buttons */}
          {status === "confirm" && (
            <div className="flex space-x-4 w-full">
              <FormButton
                variant="outline"
                onClick={handleClose}
                className="border border-action-primary text-action-primary"
              >
                <X className="h-4 w-4 mr-2" />
                Don't Cancel
              </FormButton>
              <FormButton
                onClick={handleConfirmCancel}
                className="flex-1 bg-red-500 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Cancel
              </FormButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HostEventDetails = () => {
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner");
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const isHost = owner === "host";

  const handleMintEvent = () => {
    setIsMintModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsMintModalOpen(false);
  };

  const handleOpenBidModal = () => {
    setIsBidModalOpen(true);
  };

  const handleCloseBidModal = () => {
    setIsBidModalOpen(false);
  };
  
  const handleOpenCancelModal = () => {
    setIsCancelModalOpen(true);
  };
  
  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  return (
    <div className="w-full font-sans">
      <Container className="w-full mt-4 md:mt-6">
        <div className="w-full flex items-center justify-center">
          <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center md:items-start max-w-3xl">
            <div className="w-full flex-1">
              <TrendingCard
                profileImage={eventDetail.profileImage}
                name={eventDetail.name}
                username={eventDetail.username}
                eventTitle={eventDetail.title}
                eventDate={eventDetail.date}
                eventTime={eventDetail.time}
                floorPrice={eventDetail.floorPrice}
                currentBid={eventDetail.currentBid}
              />
            </div>

            {isHost ? (
              <div className="flex flex-col flex-1 gap-2 w-full md:w-auto">
                <Button
                  size="sm"
                  className="text-black rounded-md-med px-3 md:px-4 text-sm md:text-lblm w-full"
                >
                  Share This event
                  <Share2 className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md-med text-sm md:text-lblm border-action-primary hover:bg-action-primary hover:text-black bg-transparent text-action-primary px-3 md:px-4"
                  onClick={handleOpenCancelModal}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Cancel this event
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-2">
                <Button
                  className="w-full bg-yellow-500 rounded-md-med px-3 md:px-4 text-sm md:text-lblm"
                  onClick={handleMintEvent}
                >
                  Mint Event
                </Button>
                <Button
                  
                  className="rounded-md-med px-3 md:px-4 text-sm md:text-lblm w-full"
                  onClick={handleOpenBidModal}
                >
                  Make a bid
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="my-6 md:my-12 w-full">
          <center className="my-6 md:my-8">
            <TextHeading
              className="text-xl md:text-h2"
              title="Transaction History"
            />
          </center>
          <div className="w-full flex items-center justify-center my-6 md:my-8">
            <div className="w-[90%] md:w-[7 0%]">
              <DivTable
                rows={transactionTableData.rows}
                columns={transactionTableData.columns}
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Custom Minting Modal */}
      <MintingModal isOpen={isMintModalOpen} onClose={handleCloseModal} />

      {/* Bidding Modal */}
      {isBidModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleCloseBidModal}
          />

          {/* Modal Content */}
          <div className="relative z-10 max-w-md mx-auto">
            <BiddingComponent />
          </div>
        </div>
      )}
      
      {/* Cancel Event Modal */}
      <CancelEventModal 
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
      />
    </div>
  );
};

export default HostEventDetails;
