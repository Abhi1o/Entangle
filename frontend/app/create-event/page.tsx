"use client";

import { useState, useEffect } from "react";
import EventPostingModal from "@/components/shared/event-posting-modal";

export default function CreateEventPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-open modal when page loads
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Redirect back to home page when modal is closed
    window.location.href = "/";
  };

  return (
    <div className="">
      {/* Event Posting Modal */}
      <EventPostingModal 
        isModalOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
}
