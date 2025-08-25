"use client";

import React, { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft, X } from "lucide-react";
import { FormButton } from "@/components/ui/form-button";

interface DefaultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  showFooter?: boolean;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  maxWidth?: string;
}

export default function DefaultDialog({
  isOpen,
  onClose,
  title = "Dialog Title",
  children,
  showBackButton = false,
  onBack,
  showFooter = true,
  primaryButtonText = "Confirm",
  secondaryButtonText = "Cancel",
  onPrimaryAction,
  onSecondaryAction,
  maxWidth = "md",
}: DefaultDialogProps) {
  const handlePrimaryAction = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    } else {
      onClose();
    }
  };

  const handleSecondaryAction = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    } else {
      onClose();
    }
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`font-sans bg-[var(--srf-l2,hsla(0,0%,11%,0.9))] border-light mx-auto rounded-[24px] p-0 max-h-[90vh] overflow-y-auto mt-4 ${
          maxWidth === "sm" ? "max-w-sm" : 
          maxWidth === "lg" ? "max-w-lg" : 
          maxWidth === "xl" ? "max-w-xl" : 
          maxWidth === "2xl" ? "max-w-2xl" : 
          "max-w-md"
        }`}
      >
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackAction}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white absolute top-4 right-4"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Title */}
          {title && (
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">{title}</h2>
            </div>
          )}

          {/* Content */}
          <div className="space-y-4">
            {children}
          </div>

          {/* Footer */}
          {showFooter && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <FormButton 
                onClick={handleSecondaryAction} 
                variant="outline"
              >
                {secondaryButtonText}
              </FormButton>
              <FormButton 
                onClick={handlePrimaryAction}
              >
                {primaryButtonText}
              </FormButton>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Example usage:
// <DefaultDialog 
//   isOpen={isDialogOpen} 
//   onClose={() => setIsDialogOpen(false)}
//   title="Confirm Action"
//   primaryButtonText="Submit"
//   secondaryButtonText="Cancel"
// >
//   <p className="text-white">Are you sure you want to proceed with this action?</p>
// </DefaultDialog>
