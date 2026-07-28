"use client";

import React, { useEffect, useState } from "react";
import { ChatOpsGlobe } from "./ChatOpsGlobe";
import "./ChatOpsSuccessOverlay.scss";

interface ChatOpsSuccessOverlayProps {
  onComplete: () => void;
}

export default function ChatOpsSuccessOverlay({ onComplete }: ChatOpsSuccessOverlayProps) {
  const [step, setStep] = useState<"loading" | "sent">("loading");
  const [dots, setDots] = useState("");

  // Animate the dots during the loading step
  useEffect(() => {
    if (step !== "loading") return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    // 1. Loading phase -> 3s
    const successTimer = setTimeout(() => {
      setStep("sent");
    }, 3000);

    // 2. Complete and call callback -> 4.2s
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4200);

    return () => {
      clearTimeout(successTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="chatops-success-overlay">
      <div className="success-backdrop-glow"></div>
      <div className="success-card">
        <div className="animation-portal-frame">
          {step === "loading" ? (
            <div className="globe-wrapper">
              <ChatOpsGlobe size={80} />
            </div>
          ) : (
            <div className="checkmark-container">
              {/* Self-drawing success checkmark */}
              <svg viewBox="0 0 52 52" className="checkmark-svg">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14 27l7.5 7.5 16.5-16.5" />
              </svg>
            </div>
          )}
        </div>

        <div className="text-frame">
          {step === "loading" && (
            <h2 className="loading-text">
              Connecting ChatOps request{dots}
            </h2>
          )}
          {step === "sent" && (
            <div className="success-content">
              <h2 className="success-header">Request Sent Successfully!</h2>
              <p className="success-subtext">ChatOps active • Channels connected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
