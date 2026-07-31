import React from "react";
import { IndustryAssets } from "@/lib/industryAssets";
import { IndustryConfig } from "@/lib/industryConfig";

interface PromotionalBannerProps {
  assets: IndustryAssets;
  config: IndustryConfig;
}

export function PromotionalBanner({ assets, config }: PromotionalBannerProps) {
  return (
    <section className="sf-promo-banner">
      <div
        className="sf-promo-bg"
        style={{ backgroundImage: `url(${assets.banner})` }}
      >
        <div className="sf-promo-overlay" />
      </div>

      <div className="sf-promo-content">
        <div className="sf-promo-badge">{config.promoBadge}</div>
        <h2 className="sf-promo-title">{config.promoTitle}</h2>
        <p className="sf-promo-desc">{config.promoSubtitle}</p>
        <div className="sf-promo-action">
          <a href="#catalog" className="sf-btn sf-btn-primary">
            Claim Offer ({config.promoCode}) →
          </a>
        </div>
      </div>
    </section>
  );
}
