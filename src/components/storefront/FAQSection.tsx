import React, { useState } from "react";
import { IndustryConfig } from "@/lib/industryConfig";

interface FAQSectionProps {
  config: IndustryConfig;
}

export function FAQSection({ config }: FAQSectionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="sf-faq-section">
      <div className="sf-section-header">
        <span className="sf-section-tag">Got Questions?</span>
        <h2 className="sf-section-title">Frequently Asked Questions</h2>
      </div>

      <div className="sf-faq-container">
        {config.faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className={`sf-faq-item ${isOpen ? "open" : ""}`}>
              <button
                className="sf-faq-question"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
              >
                <span>{faq.q}</span>
                <span className="sf-faq-arrow">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <div className="sf-faq-answer"><p>{faq.a}</p></div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
