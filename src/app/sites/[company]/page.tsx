"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPublicProducts, getPublicProfile } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import PublicLoadingScreen from "@/components/PublicLoadingScreen";
import BusinessAtmosphere from "@/components/BusinessAtmosphere";
import { getIndustryAssets } from "@/lib/industryAssets";
import { getIndustryConfig } from "@/lib/industryConfig";
import { SOCIAL_ICONS, CART_ICON } from "@/lib/publicIcons";
import { useInventorySocket } from "@/lib/useSocket";

import { HeroSection } from "@/components/storefront/HeroSection";
import { BusinessHighlights } from "@/components/storefront/BusinessHighlights";
import { PromotionalBanner } from "@/components/storefront/PromotionalBanner";
import { CategoryGrid } from "@/components/storefront/CategoryGrid";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { AboutSection } from "@/components/storefront/AboutSection";
import { WhyChooseUs } from "@/components/storefront/WhyChooseUs";
import { DeliveryProcess } from "@/components/storefront/DeliveryProcess";
import { TestimonialsSection } from "@/components/storefront/TestimonialsSection";
import { ContactSection } from "@/components/storefront/ContactSection";
import { FAQSection } from "@/components/storefront/FAQSection";
import { StoreFooter } from "@/components/storefront/StoreFooter";

import "@/styles/storefront.scss";

const SOCIAL_KEYS = [
  { key: "whatsappProfile", id: "whatsapp" },
  { key: "instagramProfile", id: "instagram" },
  { key: "facebookProfile", id: "facebook" },
  { key: "youtubeProfile", id: "youtube" },
  { key: "tiktokProfile", id: "tiktok" },
  { key: "threadsProfile", id: "threads" },
  { key: "xProfile", id: "x" },
  { key: "linkedInProfile", id: "linkedin" },
];

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

const formatAddress = (addressStr: any) => {
  if (!addressStr) return "";
  if (typeof addressStr === "object") {
    return addressStr.address || addressStr.city || "Official Location";
  }
  return String(addressStr);
};

export default function ProductsPage() {
  const params = useParams();
  const company = params.company as string;
  const { addToCart, items: cartItems, getAvailableQuantity } = useCart();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [products, setProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inventoryType, setInventoryType] = useState<"product" | "service">("product");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [size] = useState(24);

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
          whatsappProfile: raw.store?.socialProfiles?.whatsapp,
          telegramProfile: raw.store?.socialProfiles?.telegram,
        };
        setProfile(mapped);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }, [company]);

  const loadProducts = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    try {
      const data = await getPublicProducts(company, {
        page,
        limit: size,
        selectedPType: inventoryType,
        search: debouncedSearch,
        selectedTag,
      });
      setProducts(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, [company, page, size, inventoryType, debouncedSearch, selectedTag]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSocketUpdate = useCallback(
    (data: { itemId: string; company: string; quantity: number }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p.itemId === data.itemId ? { ...p, quantity: data.quantity } : p
        )
      );
    },
    []
  );

  useInventorySocket(handleSocketUpdate, company);

  const formatPrice = (price?: number, currency?: any) => {
    const code = typeof currency === "object" ? currency?.code || "USD" : "USD";
    if (!price) return "Contact Price";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
    }).format(price);
  };

  // ─── Rule of Hooks: Unconditional Hook Calls ───────────────
  const industryAssets = useMemo(
    () => getIndustryAssets(profile?.industry),
    [profile?.industry]
  );

  const industryConfig = useMemo(
    () => getIndustryConfig(profile?.industry),
    [profile?.industry]
  );

  if (loading && !profile) {
    return (
      <PublicLoadingScreen
        industry={profile?.industry}
        selectedTheme={profile?.selectedTheme}
      />
    );
  }

  // Inject CSS custom variables dynamically based on active industry config
  const customStyles = {
    "--sf-primary": industryConfig.primaryColor,
    "--sf-primary-rgb": industryConfig.primaryRgb,
    "--sf-accent": industryConfig.accentColor,
    "--sf-bg": industryConfig.bgDark,
    "--sf-surface": industryConfig.surfaceDark,
    "--sf-text": industryConfig.textDark,
  } as React.CSSProperties;

  return (
    <div className="sf-storefront-root" style={customStyles}>
      <BusinessAtmosphere industry={profile?.industry} icon={profile?.businessIcon} />

      {/* 1. HERO SECTION */}
      <HeroSection
        company={company}
        profile={profile}
        assets={industryAssets}
        config={industryConfig}
        socialKeys={SOCIAL_KEYS}
        socialIcons={SOCIAL_ICONS}
        getSocialHref={getSocialHref}
      />

      {/* 2. BUSINESS HIGHLIGHTS BAR */}
      <BusinessHighlights
        profile={profile}
        config={industryConfig}
        totalProducts={total || products.length}
      />

      {/* 3. PROMOTIONAL BANNER */}
      <PromotionalBanner assets={industryAssets} config={industryConfig} />

      {/* 4. CATEGORY GRID */}
      <CategoryGrid
        assets={industryAssets}
        selectedTag={selectedTag}
        onSelectCategory={(cat) => setSelectedTag(cat)}
      />

      {/* 5. FEATURED PRODUCTS GRID */}
      <FeaturedProducts
        products={products}
        assets={industryAssets}
        companySlug={company}
        addToCart={addToCart}
        getAvailableQuantity={getAvailableQuantity}
        formatPrice={formatPrice}
        inventoryType={inventoryType}
        setInventoryType={setInventoryType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
      />

      {/* 6. ABOUT COMPANY SECTION */}
      <AboutSection
        company={company}
        profile={profile}
        assets={industryAssets}
        config={industryConfig}
      />

      {/* 7. WHY CHOOSE US */}
      <WhyChooseUs assets={industryAssets} config={industryConfig} />

      {/* 8. DELIVERY PROCESS TIMELINE */}
      <DeliveryProcess assets={industryAssets} />

      {/* 9. TESTIMONIALS */}
      <TestimonialsSection config={industryConfig} />

      {/* 10. CONTACT ADVISOR SECTION */}
      <ContactSection
        company={company}
        profile={profile}
        assets={industryAssets}
        config={industryConfig}
        formatAddress={formatAddress}
      />

      {/* 11. FAQ ACCORDION */}
      <FAQSection config={industryConfig} />

      {/* 12. STORE FOOTER */}
      <StoreFooter
        company={company}
        profile={profile}
        assets={industryAssets}
        socialKeys={SOCIAL_KEYS}
        socialIcons={SOCIAL_ICONS}
        getSocialHref={getSocialHref}
      />

      {/* FLOATING CART FAB */}
      {cartCount > 0 && (
        <Link href={`/sites/${company}/cart`} className="sf-cart-fab">
          <div className="sf-fab-icon">{CART_ICON}</div>
          <span className="sf-fab-badge">{cartCount}</span>
        </Link>
      )}
    </div>
  );
}
