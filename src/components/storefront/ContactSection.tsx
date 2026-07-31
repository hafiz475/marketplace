import React from "react";
import { IndustryAssets } from "@/lib/industryAssets";
import { IndustryConfig } from "@/lib/industryConfig";

interface ContactSectionProps {
  company: string;
  profile: any;
  assets: IndustryAssets;
  config: IndustryConfig;
  formatAddress: (addr?: any) => string;
}

export function ContactSection({
  company,
  profile,
  assets,
  config,
  formatAddress,
}: ContactSectionProps) {
  const phone = profile?.phoneNumber
    ? typeof profile.phoneNumber === "object"
      ? `${profile.phoneNumber.countryCode || ""} ${profile.phoneNumber.phoneNumber || ""}`
      : profile.phoneNumber
    : "+1 (800) 555-0199";

  const email = profile?.mailId || `contact@${company.toLowerCase()}.com`;

  return (
    <section id="contact" className="sf-contact-section">
      <div className="sf-contact-card">
        <div className="sf-contact-media">
          <img
            src={assets.illustrations.contact}
            alt="Contact Advisor"
            className="sf-contact-img"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = assets.hero;
            }}
          />
          <div className="sf-contact-status">🟢 Store Advisor Online</div>
        </div>

        <div className="sf-contact-info">
          <span className="sf-section-tag">Personalized Assistance</span>
          <h2 className="sf-contact-title">Speak with a Specialist</h2>
          <p className="sf-contact-desc">
            Have questions about product specs, commercial bulk orders, or custom delivery schedules? Our team is online and ready to guide you.
          </p>

          <div className="sf-contact-vitals">
            <div className="sf-vital-item">
              <span className="sf-vital-icon">📞</span>
              <div>
                <strong>Phone & Support</strong>
                <p>{phone}</p>
              </div>
            </div>

            <div className="sf-vital-item">
              <span className="sf-vital-icon">✉️</span>
              <div>
                <strong>Email Inquiry</strong>
                <p>{email}</p>
              </div>
            </div>

            {profile?.storeAddress && (
              <div className="sf-vital-item">
                <span className="sf-vital-icon">📍</span>
                <div>
                  <strong>Store Location</strong>
                  <p>{formatAddress(profile.storeAddress)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
