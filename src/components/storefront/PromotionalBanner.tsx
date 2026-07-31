import React from "react";
import { IndustryAssets } from "@/lib/industryAssets";
import { IndustryConfig } from "@/lib/industryConfig";

interface PromotionalBannerProps {
  assets: IndustryAssets;
  config: IndustryConfig;
}

export function PromotionalBanner({ assets, config }: PromotionalBannerProps) {
  const pointingMascot = assets.mascots?.pointing || assets.mascot;

  return (
    <section className="sf-promo-banner">
      <div
        className="sf-promo-bg"
        style={{ backgroundImage: `url(${assets.banner})` }}
      >
        <div className="sf-promo-overlay" />
      </div>

      <div className="sf-promo-container">
        {pointingMascot && (
          <div className="sf-promo-mascot-wrap">
            <img
              src={pointingMascot}
              alt={`${config.mascotName} Pointing Pose`}
              className="sf-promo-mascot-img"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
            <div className="sf-pose-pill">👉 {config.mascotName}'s Pick</div>
          </div>
        )}

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
      </div>
    </section>
  );
}
