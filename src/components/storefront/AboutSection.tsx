import React from "react";
import { IndustryAssets } from "@/lib/industryAssets";
import { IndustryConfig } from "@/lib/industryConfig";

interface AboutSectionProps {
  company: string;
  profile: any;
  assets: IndustryAssets;
  config: IndustryConfig;
}

export function AboutSection({
  company,
  profile,
  assets,
  config,
}: AboutSectionProps) {
  return (
    <section className="sf-about-section">
      <div className="sf-about-container">
        <div className="sf-about-text">
          <span className="sf-section-tag">About Company</span>
          <h2 className="sf-about-title">
            Welcome to {profile?.company || company}
          </h2>
          <p className="sf-about-desc">
            {profile?.aboutCompany ||
              `Leading ${config.name} provider delivering reliable solutions, premium certified parts, and exceptional customer service worldwide.`}
          </p>

          <div className="sf-about-highlights">
            <div className="sf-about-hl-item">
              <span className="sf-hl-dot">✓</span>
              <div>
                <strong>ISO Certified Standards</strong>
                <p>Strict quality control across all inventory</p>
              </div>
            </div>
            <div className="sf-about-hl-item">
              <span className="sf-hl-dot">✓</span>
              <div>
                <strong>Worldwide Shipping</strong>
                <p>Fast insured delivery directly to your door</p>
              </div>
            </div>
            <div className="sf-about-hl-item">
              <span className="sf-hl-dot">✓</span>
              <div>
                <strong>Dedicated Support</strong>
                <p>24/7 technical team ready to assist your orders</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sf-about-media">
          <div className="sf-about-artwork-card">
            <img
              src={assets.illustrations.about}
              alt="About Us"
              className="sf-about-img"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = assets.hero;
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
