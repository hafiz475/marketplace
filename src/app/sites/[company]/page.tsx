"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPublicProducts, getPublicProfile } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import PublicLoadingScreen from "@/components/PublicLoadingScreen";
import {
  INDUSTRY_ICONS,
  PRODUCT_ICON,
  SERVICE_WRENCH,
  CART_ICON,
  INDUSTRIES,
  SOCIAL_ICONS,
} from "@/lib/publicIcons";
import { useInventorySocket } from "@/lib/useSocket";
import "@/styles/PublicProducts.scss";

const getSocialHref = (key: string, val: any) => {
  if (!val) return "";
  
  if (key === "whatsappProfile") {
    const phoneObj = typeof val === "object" ? val : { countryCode: "", phoneNumber: val };
    const cleanNum = `${phoneObj.countryCode || ""}${phoneObj.phoneNumber || ""}`.replace(/\+/g, "").replace(/\D/g, "");
    return cleanNum ? `https://wa.me/${cleanNum}` : "";
  }
  
  if (key === "telegramProfile") {
    const phoneObj = typeof val === "object" ? val : { countryCode: "", phoneNumber: val };
    const cleanNum = `${phoneObj.countryCode || ""}${phoneObj.phoneNumber || ""}`.replace(/\+/g, "").replace(/\D/g, "");
    return cleanNum ? `https://t.me/${cleanNum}` : "";
  }
  
  const str = typeof val === "string" ? val : "";
  if (!str) return "";
  return str.startsWith("http") ? str : `https://${str}`;
};

const formatAddress = (addressStr: string) => {
  if (!addressStr) return null;
  const parts = addressStr.split(",").map(p => p.trim()).filter(Boolean);
  if (parts.length <= 2) {
    return <span>{addressStr}</span>;
  }
  
  let zipIdx = parts.findIndex(p => /^\d{5,6}$/.test(p) || /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(p));
  let splitIdx = parts.length - 3;
  
  if (zipIdx !== -1) {
    splitIdx = Math.max(1, zipIdx - 2);
  } else {
    const lastPart = parts[parts.length - 1].toLowerCase();
    if (lastPart === "india" || lastPart === "usa" || lastPart === "united states") {
      splitIdx = Math.max(1, parts.length - 4);
    }
  }
  
  const line1 = parts.slice(0, splitIdx).join(", ");
  const line2 = parts.slice(splitIdx).join(", ");
  
  return (
    <span className="address-wrapper" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <span className="address-line-1" style={{ display: 'block' }}>{line1}</span>
      <span className="address-line-2" style={{ display: 'block', marginTop: '4px', opacity: 0.85 }}>{line2}</span>
    </span>
  );
};

// Social link keys to check in profile
const SOCIAL_KEYS = [
  { key: "whatsappProfile", id: "whatsapp" },
  { key: "telegramProfile", id: "telegram" },
  { key: "instagramProfile", id: "instagram" },
  { key: "facebookProfile", id: "facebook" },
  { key: "youtubeProfile", id: "youtube" },
  { key: "xProfile", id: "x" },
  { key: "linkedInProfile", id: "linkedin" },
  { key: "tiktokProfile", id: "tiktok" },
  { key: "threadsProfile", id: "threads" },
  { key: "googleBusiness", id: "google" },
];

// Gear Cursor Component
const GearCursor = ({ themeClass = "" }: { themeClass?: string }) => {
  const mainCursor = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const moveCursor = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      if (mainCursor.current) {
        mainCursor.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        mainCursor.current.style.visibility = "visible";
        mainCursor.current.style.opacity = "1";
      }
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={mainCursor}
      className={`gear-cursor-fixed automotive-theme ${themeClass}`}
      style={{
        visibility: "hidden",
        opacity: 0,
        position: "fixed",
        top: 0,
        left: 0,
        width: "0",
        height: "0",
        zIndex: 9999999,
        pointerEvents: "none",
        transition: "opacity 0.2s ease",
      }}
    >
      <div className="cursor-gear-inner">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
        </svg>
      </div>
    </div>,
    document.body,
  );
};

interface Product {
  itemId: string;
  name: string;
  type?: string;
  category?: string;
  serviceCategory?: string;
  sku?: string;
  description?: string;
  images?: string[];
  totalRate?: number;
  salePrice?: number;
  taxPercentage?: number;
  currency?: { code?: string; symbol?: string } | string;
  duration?: string;
  tags?: { name: string; icon?: string }[];
  industry?: string | string[];
  quantity?: number;
  delivery?: any;
}

interface Profile {
  name?: string;
  company?: string;
  profileImage?: string;
  aboutCompany?: string;
  industry?: string;
  selectedTheme?: string;
  storeAddress?: string;
  storeLocation?: { latitude?: number; longitude?: number };
  phoneNumber?: { countryCode?: string; phoneNumber?: string } | string;
  instagramProfile?: string;
  facebookProfile?: string;
  youtubeProfile?: string;
  tiktokProfile?: string;
  threadsProfile?: string;
  xProfile?: string;
  linkedInProfile?: string;
  googleBusiness?: string;
  whatsappProfile?: string;
  telegramProfile?: string;
}

export default function ProductsPage() {
  const params = useParams();
  const company = params.company as string;
  const {
    items: cartItems,
    addToCart,
    updateQuantity: updateCartQuantity,
    getAvailableQuantity,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [inventoryType, setInventoryType] = useState<"product" | "service">(
    "product",
  );
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const isFirstLoadRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [allTags, setAllTags] = useState<{ name: string; icon?: string; itemType: string }[]>([]);
  const size = 24;

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const backgroundIndustries = useMemo(() => {
    const ids = new Set<string>();
    products.forEach((p) => {
      const indValue = p.industry;
      if (indValue) {
        const indArray = Array.isArray(indValue) ? indValue : [indValue];
        indArray.forEach((val) => {
          const industry = INDUSTRIES.find(
            (i) => i.id === String(val).toLowerCase(),
          );
          if (industry) ids.add(industry.id);
        });
      }
      if (p.tags) {
        p.tags.forEach((t) => {
          const name = (t.name || "").toLowerCase();
          const industry = INDUSTRIES.find(
            (i) => i.id === name || i.name.toLowerCase() === name,
          );
          if (industry) ids.add(industry.id);
        });
      }
    });
    if (ids.size === 0) ids.add("automotive");
    return Array.from(ids);
  }, [products]);

  const availableFilters = useMemo(() => {
    const tagMap = new Map<
      string,
      { id: string; name: string; icon: string }
    >();
    allTags
      .filter((tag) => !inventoryType || tag.itemType === inventoryType)
      .forEach((tag) => {
        if (tag.name) {
          tagMap.set(tag.name.toLowerCase(), {
            id: tag.name.toLowerCase(),
            name: tag.name,
            icon: tag.icon || "🛠️",
          });
        }
      });
    return Array.from(tagMap.values());
  }, [allTags, inventoryType]);

  const loadProducts = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    if (page === 0) {
      setProducts([]);
    }
    const startTime = Date.now();
    try {
      const productsRes = await getPublicProducts(company, {
        page,
        limit: size,
        selectedPType: inventoryType,
        selectedTag,
        search: debouncedSearch,
      });

      const delay = isFirstLoadRef.current ? 2000 : 500;
      const elapsed = Date.now() - startTime;
      if (elapsed < delay) {
        await new Promise((r) => setTimeout(r, delay - elapsed));
      }

      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
        setIsFirstLoad(false);
      }

      if (page === 0) {
        setProducts(productsRes.items || []);
        if (!selectedTag && !debouncedSearch) {
          setAllTags(productsRes.tags || []);
        }
      } else {
        setProducts((prev) => {
          const newItems = productsRes.items || [];
          const existingIds = new Set(prev.map((p: Product) => p.itemId));
          const filteredNewItems = newItems.filter((p: Product) => !existingIds.has(p.itemId));
          return [...prev, ...filteredNewItems];
        });
      }
      setTotal(productsRes.total || 0);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [company, page, debouncedSearch, inventoryType, selectedTag]);

  const loadProfile = useCallback(async () => {
    if (!company) return;
    try {
      const res = await getPublicProfile(company);
      const raw = res.profile;
      if (raw) {
        const mapped = {
          ...raw,
          company: raw.store?.storeName || raw.company,
          profileImage: raw.store?.storeImage,
          aboutCompany: raw.store?.aboutCompany,
          storeAddress: raw.store?.location?.address,
          storeLocation: raw.store?.location,
          selectedTheme: raw.inApps?.selectedTheme || "default",
          instagramProfile: String(raw.store?.socialProfiles?.instagram || ""),
          facebookProfile: String(raw.store?.socialProfiles?.facebook || ""),
          youtubeProfile: String(raw.store?.socialProfiles?.youtube || ""),
          tiktokProfile: String(raw.store?.socialProfiles?.tiktok || ""),
          threadsProfile: String(raw.store?.socialProfiles?.threads || ""),
          xProfile: String(raw.store?.socialProfiles?.x || ""),
          linkedInProfile: String(raw.store?.socialProfiles?.linkedIn || ""),
          googleBusiness: String(raw.store?.socialProfiles?.googleBusiness || ""),
          whatsappProfile: (() => {
            const wa = raw.store?.socialProfiles?.whatsapp;
            if (typeof wa === "object" && wa?.phoneNumber) return `${wa.countryCode || ""}${wa.phoneNumber}`;
            return String(wa || "");
          })(),
          telegramProfile: (() => {
            const tg = raw.store?.socialProfiles?.telegram;
            if (typeof tg === "object" && tg?.phoneNumber) return `${tg.countryCode || ""}${tg.phoneNumber}`;
            return String(tg || "");
          })(),
          commentLink: String(raw.store?.socialProfiles?.commentLink || ""),
        };
        setProfile(mapped);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }, [company]);

  useEffect(() => {
    loadProfile();
    loadProducts();
  }, [loadProfile, loadProducts]);

  // Dynamically update document title and favicon based on profile
  useEffect(() => {
    const storeName = profile?.company || (company ? company.charAt(0).toUpperCase() + company.slice(1) : "Store");
    document.title = `${storeName} - Catalog`;

    if (profile) {
      const faviconUrl = profile.profileImage || "/default-store.svg";
      const links = document.querySelectorAll("link[rel*='icon']");
      if (links.length > 0) {
        links.forEach((link: any) => {
          link.href = faviconUrl;
        });
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = faviconUrl;
        document.head.appendChild(link);
      }
    }
  }, [profile, company]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset selectedTag when switching tabs
  useEffect(() => {
    setSelectedTag("");
    setPage(0);
  }, [inventoryType]);

  // Reset page when tag changes
  useEffect(() => {
    setPage(0);
  }, [selectedTag]);

  // Auto-infinite scroll disabled in favor of manual Load More button

  // ───── Socket.io: Live inventory updates ─────
  const handleSocketUpdate = useCallback(
    (data: { itemId: string; company: string; quantity: number }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.itemId === data.itemId ? { ...p, quantity: data.quantity } : p,
        ),
      );
    },
    [],
  );

  useInventorySocket(handleSocketUpdate, company);

  const formatPrice = (price?: number, currency?: Product["currency"]) => {
    const currencyCode =
      typeof currency === "object" ? currency?.code || "INR" : "INR";
    if (!price) return "Contact for Price";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const pageCount = Math.ceil(total / size);

  if (loading && isFirstLoad) {
    return (
      <PublicLoadingScreen
        industry={profile?.industry}
        industryIds={backgroundIndustries}
        selectedTheme={profile?.selectedTheme}
      />
    );
  }

  // Determine theme class from profile
  const themeClass =
    profile?.selectedTheme && profile.selectedTheme !== "default"
      ? `theme-${profile.selectedTheme.toLowerCase().replace(/\s+/g, "-")}`
      : "";

  return (
    <div className={`public-products automotive-theme ${themeClass}`}>
      <GearCursor themeClass={themeClass} />

      <header className="auto-hero">
        <div className="hero-content">
          {profile?.profileImage && (
            <div className="auto-logo-container">
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="brand-logo"
              />
            </div>
          )}
          <h1 className="auto-title">{profile?.company || company}</h1>
          <p className="auto-subtitle">
            {profile?.aboutCompany || "PERFORMANCE ACCESSORIES & CUSTOM TUNING"}
          </p>

          <div className="art-socials">
            {SOCIAL_KEYS.map(({ key, id }) => {
              const val = (profile as any)?.[key];
              const href = getSocialHref(key, val);
              if (href) {
                return (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="art-social-icon"
                    title={id.charAt(0).toUpperCase() + id.slice(1)}
                  >
                    {SOCIAL_ICONS[id]}
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      </header>

      <main className="art-main">
        <div className="auto-filters carbon-tech">
          <div className="filter-top">
            <div className="inventory-toggle">
              <button
                className={`toggle-btn ${inventoryType === "product" ? "active" : ""}`}
                onClick={() => setInventoryType("product")}
                title="Products"
              >
                {PRODUCT_ICON}
              </button>
              <button
                className={`toggle-btn ${inventoryType === "service" ? "active" : ""}`}
                onClick={() => setInventoryType("service")}
                title="Services"
              >
                {SERVICE_WRENCH}
              </button>
            </div>
            <div className="search-wrap">
              <input
                type="text"
                placeholder={`Search for ${inventoryType}s...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="industry-badge-filters">
            <button
              className={`badge-tab ${!selectedTag ? "active" : ""}`}
              onClick={() => setSelectedTag("")}
            >
              <span className="badge-icon">{INDUSTRY_ICONS.all}</span> All
            </button>
            {availableFilters.map((tag) => (
              <button
                key={tag.id}
                className={`badge-tab ${selectedTag === tag.id ? "active" : ""}`}
                onClick={() => setSelectedTag(tag.id)}
              >
                <span className="badge-icon">{tag.icon}</span> {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="art-grid-container">
          {loading && products.length === 0 ? (
            <PublicLoadingScreen
              inline={true}
              variant="spinner"
              industry={profile?.industry}
              industryIds={backgroundIndustries}
              selectedTheme={profile?.selectedTheme}
            />
          ) : (
            <>
              <div className={`auto-grid ${loading ? "grid-loading" : ""}`}>
              {products
                .filter(
                  (p) =>
                    !inventoryType || (p.type || "product") === inventoryType,
                )
                .filter((p) => {
                  if (!selectedTag) return true;
                  if (p.tags && Array.isArray(p.tags)) {
                    return p.tags.some(
                      (t) => (t.name || "").toLowerCase() === selectedTag,
                    );
                  }
                  return false;
                }).length === 0 ? (
                <div className="empty-search-state">
                  <div className="empty-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>
                  <h3>No {inventoryType}s found</h3>
                  <p>
                    {searchQuery
                      ? `No results for "${searchQuery}"`
                      : "Try adjusting your filters"}
                  </p>
                </div>
              ) : (
                products
                  .filter(
                    (p) =>
                      !inventoryType || (p.type || "product") === inventoryType,
                  )
                  .filter((p) => {
                    if (!selectedTag) return true;
                    if (p.tags && Array.isArray(p.tags)) {
                      return p.tags.some(
                        (t) => (t.name || "").toLowerCase() === selectedTag,
                      );
                    }
                    return false;
                  })
                  .map((product) => {
                    const cartItem = cartItems.find(
                      (item) => item.itemId === product.itemId,
                    );
                    // Use server-aggregated available quantity
                    const availableQty =
                      product.type !== "service" &&
                      product.quantity !== undefined
                        ? getAvailableQuantity(product.itemId, product.quantity)
                        : undefined;
                    let badgeIcon: string | null = null;
                    const placeholderIcon = (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                    );

                    if (
                      product.tags &&
                      Array.isArray(product.tags) &&
                      product.tags.length > 0
                    ) {
                      const activeTagObj = selectedTag
                        ? product.tags.find(
                            (t) => (t.name || "").toLowerCase() === selectedTag,
                          ) || product.tags[0]
                        : product.tags[0];
                      if (activeTagObj?.icon) badgeIcon = activeTagObj.icon;
                    }

                    return (
                      <div key={product.itemId} className="auto-card">
                        <div className="card-image-wrap">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} />
                          ) : (
                            <div className="placeholder-auto">
                              {placeholderIcon}
                            </div>
                          )}
                          <div className="price-tag">
                            {formatPrice(
                              product.totalRate || product.salePrice,
                              product.currency,
                            )}
                            {product.taxPercentage &&
                              product.taxPercentage > 0 && (
                                <span className="tax-info">
                                  Incl. {product.taxPercentage}% Tax
                                </span>
                              )}
                          </div>
                          {badgeIcon && (
                            <div className="card-badge">{badgeIcon}</div>
                          )}
                          {product.type === "service" && product.duration && (
                            <div className="duration-tag">
                              ⏱️ {product.duration}
                            </div>
                          )}

                          <div
                            className="cart-controls"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            {product.type !== "service" &&
                              availableQty !== undefined &&
                              cartItem &&
                              cartItem.quantity >= availableQty && (
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "-20px",
                                    left: "0",
                                    color: "#ef4444",
                                    fontSize: "0.7rem",
                                    fontWeight: "bold",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Available stock ({availableQty})
                                </div>
                              )}
                            {cartItem ? (
                              <div className="quantity-toggle">
                                <button
                                  className="q-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateCartQuantity(
                                      product.itemId,
                                      cartItem.quantity - 1,
                                    );
                                  }}
                                >
                                  -
                                </button>
                                <span className="q-val">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  className="q-btn"
                                  disabled={
                                    product.type !== "service" &&
                                    availableQty !== undefined &&
                                    cartItem.quantity >= availableQty
                                  }
                                  style={{
                                    opacity:
                                      product.type !== "service" &&
                                      availableQty !== undefined &&
                                      cartItem.quantity >= availableQty
                                        ? 0.5
                                        : 1,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      product.type !== "service" &&
                                      availableQty !== undefined &&
                                      cartItem.quantity >= availableQty
                                    )
                                      return;
                                    updateCartQuantity(
                                      product.itemId,
                                      cartItem.quantity + 1,
                                    );
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                className="add-to-cart-btn"
                                disabled={
                                  product.type !== "service" &&
                                  availableQty !== undefined &&
                                  availableQty < 1
                                }
                                style={{
                                  opacity:
                                    product.type !== "service" &&
                                    availableQty !== undefined &&
                                    availableQty < 1
                                      ? 0.5
                                      : 1,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    product.type !== "service" &&
                                    availableQty !== undefined &&
                                    availableQty < 1
                                  )
                                    return;
                                  const currencySymbol =
                                    typeof product.currency === "object"
                                      ? product.currency?.symbol ||
                                        product.currency?.code ||
                                        "₹"
                                      : product.currency || "₹";
                                  addToCart({
                                    itemId: product.itemId,
                                    name: product.name,
                                    price:
                                      product.totalRate ||
                                      product.salePrice ||
                                      0,
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
                                    image: product.images?.[0],
                                    companySlug: company,
                                    delivery: product.delivery,
                                  });
                                }}
                              >
                                {product.type !== "service" &&
                                availableQty !== undefined &&
                                availableQty < 1
                                  ? "OUT OF STOCK"
                                  : "ADD +"}
                              </button>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/sites/${company}/${product.itemId}`}
                          className="card-info"
                        >
                          <span className="category-label">
                            {product.type === "service"
                              ? product.serviceCategory || product.category
                              : product.category}
                          </span>
                          <h3 className="product-name">{product.name}</h3>
                          <div className="view-link">
                            {product.type === "service"
                              ? "SERVICE DETAILS →"
                              : "TECHNICAL SPECS →"}
                          </div>
                        </Link>
                      </div>
                    );
                  })
              )}
            </div>
            {products.length < total && !loading && (
              <div className="load-more-container">
                <button
                  className="load-more-btn"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Load More
                </button>
              </div>
            )}
            <div ref={sentinelRef} className="scroll-sentinel">
              {loading && products.length > 0 && (
                <div className="scroll-loader">
                  <div className="scroll-spinner" />
                  <span>Loading more...</span>
                </div>
              )}
            </div>
          </>)}
        </div>
      </main>

      <footer className="art-footer">
        <div className="footer-wrap">
          <div className="art-contact">
            <h3>Find Us</h3>
            {profile?.storeAddress &&
              (profile?.storeLocation?.latitude &&
              profile?.storeLocation?.longitude ? (
                <a
                  href={`https://www.google.com/maps?q=${profile.storeLocation.latitude},${profile.storeLocation.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="location-text location-link"
                  style={{ alignItems: 'flex-start' }}
                >
                  <span className="location-icon" style={{ marginTop: '3px' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </span>
                  {formatAddress(profile.storeAddress)}
                </a>
              ) : (
                <p className="location-text" style={{ alignItems: 'flex-start' }}>
                  <span className="location-icon" style={{ marginTop: '3px' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </span>
                  {formatAddress(profile.storeAddress)}
                </p>
              ))}
            <div className="footer-vitals">
              {profile?.phoneNumber && (
                <p className="phone">
                  {typeof profile.phoneNumber === "object"
                    ? `${profile.phoneNumber.countryCode} ${profile.phoneNumber.phoneNumber}`
                    : profile.phoneNumber}
                </p>
              )}
            </div>

            <div className="footer-socials">
              {SOCIAL_KEYS.map(({ key, id }) => {
                const val = (profile as any)?.[key];
                const href = getSocialHref(key, val);
                if (href) {
                  return (
                    <a
                      key={id}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="footer-social-icon"
                      title={id.charAt(0).toUpperCase() + id.slice(1)}
                    >
                      {SOCIAL_ICONS[id]}
                    </a>
                  );
                }
                return null;
              })}
            </div>
          </div>
          <div className="art-rights">
            <p>
              &copy; {new Date().getFullYear()} {profile?.name || company}
            </p>
            <p className="brand">
              Powered by{" "}
              <Link href="/" className="highlight">
                CirclTrade
              </Link>
            </p>
          </div>
        </div>
      </footer>

      {cartCount > 0 && (
        <Link href={`/sites/${company}/cart`} className="cart-fab">
          <div className="fab-icon">{CART_ICON}</div>
          <span className="fab-badge">{cartCount}</span>
        </Link>
      )}
    </div>
  );
}
