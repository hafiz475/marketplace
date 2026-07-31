import React from "react";
import { IndustryConfig } from "@/lib/industryConfig";

interface TestimonialsSectionProps {
  config: IndustryConfig;
}

export function TestimonialsSection({ config }: TestimonialsSectionProps) {
  const reviews = [
    {
      name: "Marcus Vance",
      country: "United States",
      stars: "★★★★★",
      title: "Outstanding Quality & Fast Shipping",
      comment:
        "Ordered industrial equipment for our project site. Arrived 24 hours earlier than expected in flawless condition. Extremely satisfied!",
    },
    {
      name: "Sophia Rossi",
      country: "Germany",
      stars: "★★★★★",
      title: "Professional Service & Support",
      comment:
        "The live chat advisor guided me through selecting exact specifications. Genuine certified items backed by official warranty.",
    },
    {
      name: "Kenji Takahashi",
      country: "Japan",
      stars: "★★★★★",
      title: "Top-Tier Customer Experience",
      comment:
        "Seamless checkout, transparent tracking, and robust packaging. Will definitely be placing regular commercial orders here.",
    },
  ];

  return (
    <section className="sf-testimonials-section">
      <div className="sf-section-header">
        <span className="sf-section-tag">Client Feedback</span>
        <h2 className="sf-section-title">What Buyers Say</h2>
      </div>

      <div className="sf-testimonials-grid">
        {reviews.map((r, idx) => (
          <div key={idx} className="sf-testimonial-card">
            <div className="sf-test-stars">{r.stars}</div>
            <h4 className="sf-test-title">"{r.title}"</h4>
            <p className="sf-test-comment">{r.comment}</p>
            <div className="sf-test-author">
              <strong>{r.name}</strong>
              <span>📍 {r.country}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
