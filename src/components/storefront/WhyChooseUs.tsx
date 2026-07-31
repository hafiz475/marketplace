import React from "react";
import { IndustryAssets } from "@/lib/industryAssets";
import { IndustryConfig } from "@/lib/industryConfig";

interface WhyChooseUsProps {
  assets: IndustryAssets;
  config: IndustryConfig;
}

export function WhyChooseUs({ assets, config }: WhyChooseUsProps) {
  const thumbsMascot = assets.mascots?.thumbs || assets.mascot;

  return (
    <section className="sf-why-section">
      <div className="sf-section-header">
        <span className="sf-section-tag">Our Commitment</span>
        <h2 className="sf-section-title">Why Choose Our Store</h2>
      </div>

      <div className="sf-why-showcase">
        {thumbsMascot && (
          <div className="sf-why-mascot-wrap">
            <img
              src={thumbsMascot}
              alt={`${config.mascotName} Thumbs Up`}
              className="sf-why-mascot-img"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.style.display = "none";
              }}
            />
            <div className="sf-pose-pill">👍 100% Quality Guaranteed</div>
          </div>
        )}

        <div className="sf-why-grid">
          {config.features.map((feat, idx) => (
            <div key={idx} className="sf-why-card">
              <div className="sf-why-icon">{feat.icon}</div>
              <h3 className="sf-why-title">{feat.title}</h3>
              <p className="sf-why-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
