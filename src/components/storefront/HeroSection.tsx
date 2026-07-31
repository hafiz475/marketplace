import React from "react";
import Link from "next/link";
import { IndustryAssets } from "@/lib/industryAssets";
import { IndustryConfig } from "@/lib/industryConfig";

interface HeroSectionProps {
  company: string;
  profile: any;
  assets: IndustryAssets;
  config: IndustryConfig;
  socialKeys: { key: string; id: string }[];
  socialIcons: Record<string, React.ReactNode>;
  getSocialHref: (key: string, val: any) => string;
}

export function HeroSection({
  company,
  profile,
  assets,
  config,
  socialKeys,
  socialIcons,
  getSocialHref,
}: HeroSectionProps) {
  return (
    <header className="sf-hero">
      <div
        className="sf-hero-banner"
        style={{ backgroundImage: `url(${assets.banner})` }}
      >
        <div className="sf-hero-overlay" />
      </div>

      <div className="sf-hero-container">
        <div className="sf-hero-showcase">
          <div className="sf-hero-artwork">
            <img
              src={assets.hero}
              alt={`${assets.label} Storefront`}
              className="sf-storefront-img"
            />
            <div className="sf-artwork-badge">3D Storefront</div>
          </div>

          {assets.mascot && (
            <div className="sf-mascot-artwork">
              <img
                src={assets.mascot}
                alt={`${assets.label} Mascot`}
                className="sf-mascot-img"
              />
            </div>
          )}
        </div>

        <div className="sf-hero-text">
          {profile?.profileImage && (
            <div className="sf-logo-wrap">
              <img
                src={profile.profileImage}
                alt={profile.name || "Brand Logo"}
                className="sf-brand-logo"
              />
            </div>
          )}

          <div className="sf-badge-pill">
            <span className="sf-badge-dot" />
            {assets.label} Official Store
          </div>

          <h1 className="sf-hero-title">{profile?.company || company}</h1>

          <p className="sf-hero-subtitle">
            {profile?.aboutCompany || config.tagline}
          </p>

          <div className="sf-hero-ctas">
            <a href="#catalog" className="sf-btn sf-btn-primary">
              Browse Products →
            </a>
            <a href="#contact" className="sf-btn sf-btn-outline">
              Contact Us
            </a>
          </div>

          <div className="sf-socials-row">
            {socialKeys.map(({ key, id }) => {
              const val = (profile as any)?.[key];
              const href = getSocialHref(key, val);
              if (!href) return null;
              return (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="sf-social-link"
                  title={id.charAt(0).toUpperCase() + id.slice(1)}
                >
                  {socialIcons[id]}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
