import React from "react";
import Link from "next/link";
import { IndustryAssets } from "@/lib/industryAssets";

interface Product {
  itemId: string;
  name: string;
  type?: string;
  category?: string;
  serviceCategory?: string;
  description?: string;
  images?: string[];
  salePrice?: number;
  totalRate?: number;
  taxPercentage?: number;
  currency?: any;
  quantity?: number;
  sku?: string;
  tags?: { name: string; icon?: string }[];
  delivery?: any;
}

interface FeaturedProductsProps {
  products: Product[];
  assets: IndustryAssets;
  companySlug: string;
  addToCart: (item: any) => void;
  getAvailableQuantity: (itemId: string, totalStock: number) => number;
  formatPrice: (price?: number, currency?: any) => string;
  inventoryType: "product" | "service";
  setInventoryType: (type: "product" | "service") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}

export function FeaturedProducts({
  products,
  assets,
  companySlug,
  addToCart,
  getAvailableQuantity,
  formatPrice,
  inventoryType,
  setInventoryType,
  searchQuery,
  setSearchQuery,
  selectedTag,
  setSelectedTag,
}: FeaturedProductsProps) {
  return (
    <section id="catalog" className="sf-products-section">
      <div className="sf-section-header">
        <span className="sf-section-tag">Explore Collection</span>
        <h2 className="sf-section-title">Featured Inventory</h2>
      </div>

      <div className="sf-filters-bar">
        <div className="sf-toggle-group">
          <button
            className={`sf-toggle-btn ${inventoryType === "product" ? "active" : ""}`}
            onClick={() => setInventoryType("product")}
          >
            📦 Products
          </button>
          <button
            className={`sf-toggle-btn ${inventoryType === "service" ? "active" : ""}`}
            onClick={() => setInventoryType("service")}
          >
            🔧 Services
          </button>
        </div>

        <div className="sf-search-wrap">
          <input
            type="text"
            placeholder={`Search ${inventoryType}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="sf-empty-state">
          <div className="sf-empty-icon">🔍</div>
          <h3>No {inventoryType}s found</h3>
          <p>Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="sf-products-grid">
          {products.map((product, idx) => {
            const availableQty =
              product.type !== "service" && product.quantity !== undefined
                ? getAvailableQuantity(product.itemId, product.quantity || 0)
                : undefined;

            const productImage =
              product.images?.[0] ||
              (assets.products.length > 0
                ? assets.products[idx % assets.products.length]?.image
                : assets.hero);

            return (
              <div key={product.itemId} className="sf-product-card">
                <div className="sf-card-media">
                  <img
                    src={productImage}
                    alt={product.name}
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = assets.hero;
                    }}
                  />

                  <div className="sf-card-price">
                    {formatPrice(
                      product.totalRate || product.salePrice,
                      product.currency
                    )}
                  </div>

                  {product.type && (
                    <span className="sf-card-type">{product.type}</span>
                  )}
                </div>

                <div className="sf-card-body">
                  <span className="sf-card-category">
                    {product.type === "service"
                      ? product.serviceCategory || product.category
                      : product.category || assets.label}
                  </span>

                  <h3 className="sf-card-title">{product.name}</h3>

                  <p className="sf-card-desc">
                    {product.description
                      ? product.description.substring(0, 85) + "..."
                      : "High quality " + assets.label + " item."}
                  </p>

                  <div className="sf-card-footer">
                    <button
                      className="sf-btn-add"
                      disabled={
                        product.type !== "service" &&
                        availableQty !== undefined &&
                        availableQty < 1
                      }
                      onClick={() => {
                        const currencySymbol =
                          typeof product.currency === "object"
                            ? product.currency?.symbol ||
                              product.currency?.code ||
                              "$"
                            : product.currency || "$";
                        addToCart({
                          itemId: product.itemId,
                          name: product.name,
                          price:
                            product.totalRate || product.salePrice || 0,
                          quantity: 1,
                          maxQuantity: availableQty,
                          taxPercentage: product.taxPercentage,
                          currency: currencySymbol,
                          type: product.type,
                          sku: product.sku,
                          category:
                            product.type === "service"
                              ? product.serviceCategory
                              : product.category,
                          description: product.description,
                          image: productImage,
                          companySlug: companySlug,
                          delivery: product.delivery,
                        });
                      }}
                    >
                      {product.type !== "service" &&
                      availableQty !== undefined &&
                      availableQty < 1
                        ? "Out of Stock"
                        : "Add to Cart +"}
                    </button>

                    <Link
                      href={`/sites/${companySlug}/${product.itemId}`}
                      className="sf-card-detail-link"
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
