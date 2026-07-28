"use client";

import React, { useState, useEffect } from "react";
import { INDUSTRY_ICONS } from "@/lib/publicIcons";
import "./PublicLoadingScreen.scss";

interface PublicLoadingScreenProps {
  industry?: string;
  industryIds?: string[];
  inline?: boolean;
  variant?: "icons" | "spinner";
  selectedTheme?: string;
}

const PublicLoadingScreen: React.FC<PublicLoadingScreenProps> = ({
  industry = "default",
  industryIds = [],
  inline = false,
  variant = "icons",
  selectedTheme = "default",
}) => {
  const [iconIndex, setIconIndex] = useState(0);

  const normalizeIndustry = (name: string): string | null => {
    if (!name || typeof name !== "string") return null;
    return name.toLowerCase().replace(/\s+/g, "_").replace(/&/g, "");
  };

  const getIndustryIcon = (name: string): React.ReactNode | null => {
    const normalized = normalizeIndustry(name);
    if (!normalized) return null;
    return (
      INDUSTRY_ICONS[normalized] ||
      INDUSTRY_ICONS[normalized.replace(/_/g, "")] ||
      INDUSTRY_ICONS[name.toLowerCase()] ||
      null
    );
  };

  const getCyclingIcons = (): React.ReactNode[] => {
    const baseIcons: React.ReactNode[] = [];

    if (industryIds && industryIds.length > 0) {
      industryIds.forEach((id) => {
        const icon = getIndustryIcon(id);
        if (icon) baseIcons.push(icon);
      });
    }

    if (industry && industry !== "default") {
      const mainIcon = getIndustryIcon(industry);
      if (mainIcon && !baseIcons.includes(mainIcon)) baseIcons.push(mainIcon);
    }

    if (baseIcons.length < 3) {
      const defaultIcons = [
        INDUSTRY_ICONS.automotive,
        INDUSTRY_ICONS.technology,
        INDUSTRY_ICONS.manufacturing,
        INDUSTRY_ICONS.logistics,
      ];
      defaultIcons.forEach((icon) => {
        if (icon && !baseIcons.includes(icon)) {
          baseIcons.push(icon);
        }
      });
    }

    const uniqueIcons: React.ReactNode[] = [];
    const seen = new Set<React.ReactNode>();
    baseIcons.forEach((icon) => {
      if (icon && !seen.has(icon)) {
        uniqueIcons.push(icon);
        seen.add(icon);
      }
    });

    return uniqueIcons;
  };

  const icons = getCyclingIcons();

  useEffect(() => {
    const interval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length);
    }, 800);
    return () => clearInterval(interval);
  }, [icons.length]);

  // Determine theme class
  const themeClass =
    selectedTheme && selectedTheme !== "default"
      ? `theme-${selectedTheme.toLowerCase().replace(/\s+/g, "-")}`
      : "automotive-theme";

  return (
    <div
      className={`public-loading-screen ${inline ? "inline" : "fullscreen"} variant-${variant} ${themeClass}`}
    >
      <div className="loader-content">
        {variant === "spinner" ? (
          <div className="themed-spinner-container">
            <div className="themed-spinner"></div>
          </div>
        ) : (
          <>
            <div className="icon-cycle-container">
              {icons.map((icon, idx) => (
                <div
                  key={idx}
                  className={`loader-icon ${idx === iconIndex ? "active" : ""}`}
                >
                  {icon}
                </div>
              ))}
              <div className="loader-glow"></div>
            </div>
            {!inline && (
              <div className="loader-text">
                <span className="dot">.</span>
                <span className="dot">.</span>
                <span className="dot">.</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicLoadingScreen;
