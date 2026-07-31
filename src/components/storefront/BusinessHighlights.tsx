import React from "react";
import { IndustryConfig } from "@/lib/industryConfig";

interface BusinessHighlightsProps {
  profile: any;
  config: IndustryConfig;
  totalProducts: number;
}

export function BusinessHighlights({
  profile,
  config,
  totalProducts,
}: BusinessHighlightsProps) {
  const rating = profile?.profileRating || "5.0";
  const reviewsCount = profile?.reviewsCount || "24";
  const rawCountry = profile?.store?.country;
  const countryName =
    typeof rawCountry === "object"
      ? rawCountry?.name || rawCountry?.iso2 || "Japan"
      : typeof rawCountry === "string" && rawCountry
      ? rawCountry
      : "Japan";

  return (
    <section className="sf-highlights">
      <div className="sf-highlights-grid">
        <div className="sf-highlight-card">
          <div className="sf-hl-icon">⭐</div>
          <div className="sf-hl-content">
            <div className="sf-hl-val">{rating} / 5.0</div>
            <div className="sf-hl-label">{reviewsCount} Verified Reviews</div>
          </div>
        </div>

        <div className="sf-highlight-card">
          <div className="sf-hl-icon">🌐</div>
          <div className="sf-hl-content">
            <div className="sf-hl-val">{countryName}</div>
            <div className="sf-hl-label">Worldwide Shipping</div>
          </div>
        </div>

        <div className="sf-highlight-card">
          <div className="sf-hl-icon">🏆</div>
          <div className="sf-hl-content">
            <div className="sf-hl-val">Verified Partner</div>
            <div className="sf-hl-label">Official Storefront</div>
          </div>
        </div>

        <div className="sf-highlight-card">
          <div className="sf-hl-icon">📦</div>
          <div className="sf-hl-content">
            <div className="sf-hl-val">{totalProducts}+ Items</div>
            <div className="sf-hl-label">Live Inventory Catalog</div>
          </div>
        </div>
      </div>
    </section>
  );
}
