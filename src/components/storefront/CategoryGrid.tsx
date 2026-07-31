import React from "react";
import { IndustryAssets } from "@/lib/industryAssets";

interface CategoryGridProps {
  assets: IndustryAssets;
  selectedTag: string;
  onSelectCategory: (categoryName: string) => void;
}

export function CategoryGrid({
  assets,
  selectedTag,
  onSelectCategory,
}: CategoryGridProps) {
  if (!assets.categories || assets.categories.length === 0) return null;

  return (
    <section className="sf-categories-section">
      <div className="sf-section-header">
        <span className="sf-section-tag">Browse Catalog</span>
        <h2 className="sf-section-title">Industry Categories</h2>
      </div>

      <div className="sf-categories-grid">
        {assets.categories.map((cat) => {
          const isActive =
            selectedTag.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.name}
              className={`sf-category-card ${isActive ? "active" : ""}`}
              onClick={() =>
                onSelectCategory(isActive ? "" : cat.name.toLowerCase())
              }
            >
              <div className="sf-category-img-wrap">
                <img
                  src={cat.image}
                  alt={cat.name}
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = assets.hero;
                  }}
                />
              </div>
              <span className="sf-category-name">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
