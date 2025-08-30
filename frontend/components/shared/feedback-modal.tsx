"use client";

import React, { useState, ReactNode, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FormButton } from "@/components/ui/form-button";
import { CheckCircle, AlertCircle, XCircle, ArrowRight } from "lucide-react";
import Image from "next/image";

// Define the possible states for the feedback modal
export type FeedbackType = "loading" | "success" | "error" | "info" | "confirmation";

// Define the props for the FeedbackModal component
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: FeedbackType;
  title?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  autoCloseDelay?: number; // in milliseconds, if provided will auto-close after delay
  showCloseButton?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  nextStep?: {
    type: FeedbackType;
    title?: string;
    description?: string;
    primaryButtonText?: string;
    secondaryButtonText?: string;
    onPrimaryAction?: () => void;
    onSecondaryAction?: () => void;
    autoCloseDelay?: number;
  };
}

export default function FeedbackModal({
  isOpen,
  onClose,
  type = "info",
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  onPrimaryAction,
  onSecondaryAction,
  autoCloseDelay,
  showCloseButton = true,
  icon,
  children,
  nextStep,
}: FeedbackModalProps) {
  const [currentType, setCurrentType] = useState<FeedbackType>(type);
  const [currentTitle, setCurrentTitle] = useState<string | undefined>(title);
  const [currentDescription, setCurrentDescription] = useState<string | undefined>(description);
  const [currentPrimaryButtonText, setCurrentPrimaryButtonText] = useState<string | undefined>(primaryButtonText);
  const [currentSecondaryButtonText, setCurrentSecondaryButtonText] = useState<string | undefined>(secondaryButtonText);
  const [currentOnPrimaryAction, setCurrentOnPrimaryAction] = useState<(() => void) | undefined>(onPrimaryAction);
  const [currentOnSecondaryAction, setCurrentOnSecondaryAction] = useState<(() => void) | undefined>(onSecondaryAction);
  const [currentAutoCloseDelay, setCurrentAutoCloseDelay] = useState<number | undefined>(autoCloseDelay);

  // Handle auto-close if autoCloseDelay is provided
  useEffect(() => {
    if (isOpen && currentAutoCloseDelay) {
      const timer = setTimeout(() => {
        if (nextStep) {
          // Move to next step instead of closing
          setCurrentType(nextStep.type);
          setCurrentTitle(nextStep.title);
          setCurrentDescription(nextStep.description);
          setCurrentPrimaryButtonText(nextStep.primaryButtonText);
          setCurrentSecondaryButtonText(nextStep.secondaryButtonText);
          setCurrentOnPrimaryAction(nextStep.onPrimaryAction);
          setCurrentOnSecondaryAction(nextStep.onSecondaryAction);
          setCurrentAutoCloseDelay(nextStep.autoCloseDelay);
        } else {
          onClose();
        }
      }, currentAutoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentAutoCloseDelay, nextStep, onClose, currentType]);

  // Reset to initial state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentType(type);
      setCurrentTitle(title);
      setCurrentDescription(description);
      setCurrentPrimaryButtonText(primaryButtonText);
      setCurrentSecondaryButtonText(secondaryButtonText);
      setCurrentOnPrimaryAction(onPrimaryAction);
      setCurrentOnSecondaryAction(onSecondaryAction);
      setCurrentAutoCloseDelay(autoCloseDelay);
    }
  }, [
    isOpen, 
    type, 
    title, 
    description, 
    primaryButtonText, 
    secondaryButtonText, 
    onPrimaryAction, 
    onSecondaryAction, 
    autoCloseDelay
  ]);

  // Handle primary action
  const handlePrimaryAction = () => {
    if (currentOnPrimaryAction) {
      currentOnPrimaryAction();
    } else if (nextStep) {
      // Move to next step if no action is provided
      setCurrentType(nextStep.type);
      setCurrentTitle(nextStep.title);
      setCurrentDescription(nextStep.description);
      setCurrentPrimaryButtonText(nextStep.primaryButtonText);
      setCurrentSecondaryButtonText(nextStep.secondaryButtonText);
      setCurrentOnPrimaryAction(nextStep.onPrimaryAction);
      setCurrentOnSecondaryAction(nextStep.onSecondaryAction);
      setCurrentAutoCloseDelay(nextStep.autoCloseDelay);
    } else {
      onClose();
    }
  };

  // Handle secondary action
  const handleSecondaryAction = () => {
    if (currentOnSecondaryAction) {
      currentOnSecondaryAction();
    } else {
      onClose();
    }
  };

  // Get default values based on the current type
  const getDefaultValues = () => {
    switch (currentType) {
      case "loading":
        return {
          icon: icon || <Image src="/assets/hour_glass.png" alt="Loading" width={100} height={100} className="w-auto h-auto" />,
          title: currentTitle || "Loading...",
          description: currentDescription || "Please wait while we process your request.",
          showButtons: false,
        };
      case "success":
        return {
          icon: icon || <CheckCircle className="h-12 w-12 text-green-500" />,
          title: currentTitle || "Success!",
          description: currentDescription || "Your request has been processed successfully.",
          primaryButtonText: currentPrimaryButtonText || "Continue",
          showButtons: true,
        };
      case "error":
        return {
          icon: icon || <XCircle className="h-12 w-12 text-red-500" />,
          title: currentTitle || "Error",
          description: currentDescription || "An error occurred while processing your request.",
          primaryButtonText: currentPrimaryButtonText || "Try Again",
          secondaryButtonText: currentSecondaryButtonText || "Cancel",
          showButtons: true,
        };
      case "info":
        return {
          icon: icon || <AlertCircle className="h-12 w-12 text-blue-500" />,
          title: currentTitle || "Information",
          description: currentDescription || "Here's some important information for you.",
          primaryButtonText: currentPrimaryButtonText || "OK",
          showButtons: true,
        };
      case "confirmation":
        return {
          icon: icon || <AlertCircle className="h-12 w-12 text-yellow-500" />,
          title: currentTitle || "Confirmation",
          description: currentDescription || "Are you sure you want to proceed?",
          primaryButtonText: currentPrimaryButtonText || "Confirm",
          secondaryButtonText: currentSecondaryButtonText || "Cancel",
          showButtons: true,
        };
      default:
        return {
          icon: icon || <AlertCircle className="h-12 w-12 text-blue-500" />,
          title: currentTitle || "Information",
          description: currentDescription || "Here's some important information for you.",
          primaryButtonText: currentPrimaryButtonText || "OK",
          showButtons: true,
        };
    }
  };

  const {
    icon: defaultIcon,
    title: defaultTitle,
    description: defaultDescription,
    primaryButtonText: defaultPrimaryButtonText,
    secondaryButtonText: defaultSecondaryButtonText,
    showButtons,
  } = getDefaultValues();

  // Determine if we should show the next step indicator
  const showNextStepIndicator = nextStep && currentType !== "loading";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="font-sans bg-[var(--srf-l2,hsla(0,0%,11%,0.9))] border-light max-w-md mx-auto rounded-[24px] p-0 max-h-[90vh] overflow-y-auto mt-4"
      >
        <div className="p-8 space-y-6">
          {/* Icon and Title */}
          <div className="flex flex-col items-center text-center space-y-4">
            {defaultIcon}
            <h2 className="text-2xl font-semibold text-white">{defaultTitle}</h2>
            {defaultDescription && (
              <p className="text-medium-emphasis text-center">{defaultDescription}</p>
            )}
          </div>

          {/* Custom Content */}
          {children && (
            <div className="space-y-4">
              {children}
            </div>
          )}

          {/* Action Buttons */}
          {showButtons && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3 pt-4">
              {defaultSecondaryButtonText && (
                <FormButton 
                  onClick={handleSecondaryAction} 
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {defaultSecondaryButtonText}
                </FormButton>
              )}
              <FormButton 
                onClick={handlePrimaryAction}
                size="lg"
                className="w-full sm:w-auto"
              >
                {defaultPrimaryButtonText}
                {showNextStepIndicator && (
                  <ArrowRight className="ml-2 h-4 w-4" />
                )}
              </FormButton>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Example usage:
/*
// Basic usage
<FeedbackModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  type="success"
  title="Payment Successful"
  description="Your payment has been processed successfully."
/>

// With auto-close and next step
<FeedbackModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  type="loading"
  title="Processing Payment"
  autoCloseDelay={3000}
  nextStep={{
    type: "success",
    title: "Payment Successful",
    description: "Your payment has been processed successfully.",
    primaryButtonText: "View Receipt",
    onPrimaryAction: () => {
      // Handle view receipt action
    }
  }}
/>

// Multi-step flow example
const [modalState, setModalState] = useState({
  isOpen: false,
  type: "loading" as FeedbackType,
  title: "Submitting Form",
  nextStep: {
    type: "success" as FeedbackType,
    title: "Form Submitted",
    description: "Your form has been submitted successfully.",
    primaryButtonText: "Continue",
    onPrimaryAction: () => {
      setModalState({
        ...modalState,
        type: "info",
        title: "Next Steps",
        description: "Here's what happens next...",
        nextStep: undefined
      });
    }
  }
});

<FeedbackModal
  isOpen={modalState.isOpen}
  onClose={() => setModalState({...modalState, isOpen: false})}
  type={modalState.type}
  title={modalState.title}
  nextStep={modalState.nextStep}
/>
*/
