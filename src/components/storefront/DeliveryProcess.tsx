import React from "react";
import { IndustryAssets } from "@/lib/industryAssets";

interface DeliveryProcessProps {
  assets: IndustryAssets;
}

export function DeliveryProcess({ assets }: DeliveryProcessProps) {
  const steps = [
    { num: "01", title: "Order Confirmed", desc: "Instant automated invoice & inventory reservation" },
    { num: "02", title: "Packed & Sealed", desc: "Quality inspected and packed in protective box" },
    { num: "03", title: "Dispatched", desc: "Handed to priority courier with GPS tracking link" },
    { num: "04", title: "On The Way", desc: "Real-time updates as package approaches your address" },
    { num: "05", title: "Delivered", desc: "Safe contactless delivery with signature proof" },
  ];

  return (
    <section className="sf-delivery-section">
      <div className="sf-delivery-container">
        <div className="sf-delivery-media">
          <img
            src={assets.illustrations.delivery}
            alt="Delivery Process"
            className="sf-delivery-img"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = assets.hero;
            }}
          />
          <div className="sf-delivery-badge">⚡ Worldwide Express Delivery Available</div>
        </div>

        <div className="sf-delivery-info">
          <span className="sf-section-tag">Fulfillment Lifecycle</span>
          <h2 className="sf-delivery-title">How Delivery Works</h2>

          <div className="sf-timeline">
            {steps.map((s, idx) => (
              <div key={idx} className="sf-timeline-step">
                <div className="sf-step-num">{s.num}</div>
                <div className="sf-step-content">
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
