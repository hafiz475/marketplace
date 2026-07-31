import React from "react";
import { IndustryAssets } from "@/lib/industryAssets";
import { IndustryConfig } from "@/lib/industryConfig";

interface WhyChooseUsProps {
  assets: IndustryAssets;
  config: IndustryConfig;
}

export function WhyChooseUs({ assets, config }: WhyChooseUsProps) {
  return (
    <section className="sf-why-section">
      <div className="sf-section-header">
        <span className="sf-section-tag">Our Commitment</span>
        <h2 className="sf-section-title">Why Choose Our Store</h2>
      </div>

      <div className="sf-why-grid">
        {config.features.map((feat, idx) => (
          <div key={idx} className="sf-why-card">
            <div className="sf-why-icon">{feat.icon}</div>
            <h3 className="sf-why-title">{feat.title}</h3>
            <p className="sf-why-desc">{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
