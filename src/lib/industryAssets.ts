// ═══════════════════════════════════════════════════════════════
// INDUSTRY ASSETS REGISTRY
// ═══════════════════════════════════════════════════════════════
// Maps every industry persona to a full visual asset pack.
// 41 personas → 14 industry asset packs.
// Usage:  const assets = getIndustryAssets(profile.industry);
//         assets.hero / assets.products / assets.illustrations.contact
// ═══════════════════════════════════════════════════════════════

export interface ProductAsset {
  name: string;
  image: string;
}

export interface CategoryAsset {
  name: string;
  image: string;
}

export interface IndustryIllustrations {
  about: string;
  contact: string;
  delivery: string;
  support: string;
  payment: string;
}

export interface MascotPoses {
  welcome: string;
  pointing: string;
  thumbs: string;
  working: string;
  contact: string;
}

export interface BannerVariants {
  sale: string;
  seasonal: string;
  offer: string;
  delivery: string;
}

export interface IndustryAssets {
  id: string;
  label: string;
  hero: string;
  heroBg: string;
  banner: string;
  banners: BannerVariants;
  mascot: string;
  mascots: MascotPoses;
  products: ProductAsset[];
  categories: CategoryAsset[];
  illustrations: IndustryIllustrations;
}

// ─── Helper ──────────────────────────────────────────────────
const base = (industry: string) => `/industry-assets/${industry}`;

function buildAssets(
  id: string,
  label: string,
  productNames: string[],
  categoryNames: string[],
): IndustryAssets {
  const b = base(id);
  return {
    id,
    label,
    hero: `${b}/hero/company.webp`,
    heroBg: `${b}/hero/hero-bg.webp`,
    banner: `${b}/banner/offer.webp`,
    banners: {
      sale: `${b}/banner/sale.webp`,
      seasonal: `${b}/banner/seasonal.webp`,
      offer: `${b}/banner/offer.webp`,
      delivery: `${b}/banner/delivery.webp`,
    },
    mascot: `${b}/mascot/welcome.webp`,
    mascots: {
      welcome: `${b}/mascot/welcome.webp`,
      pointing: `${b}/mascot/pointing.webp`,
      thumbs: `${b}/mascot/thumbs.webp`,
      working: `${b}/mascot/working.webp`,
      contact: `${b}/mascot/contact.webp`,
    },
    products: productNames.map((name) => ({
      name,
      image: `${b}/products/${name.toLowerCase().replace(/\s+/g, "-")}.png`,
    })),
    categories: categoryNames.map((name) => ({
      name,
      image: `${b}/category-icons/${name.toLowerCase().replace(/\s+/g, "-")}.png`,
    })),
    illustrations: {
      about: `${b}/about/about.webp`,
      contact: `${b}/contact/contact.webp`,
      delivery: `${b}/delivery/delivery.webp`,
      support: `${b}/contact/contact.webp`,
      payment: `${b}/delivery/delivery.webp`,
    },
  };
}

// ─── Asset Packs (14 industries) ─────────────────────────────

const AUTOMOTIVE = buildAssets(
  "automotive",
  "Automotive",
  ["car", "engine", "tyre", "battery", "brake-disc", "headlight", "oil", "spark-plug"],
  ["engines", "tyres", "batteries", "accessories", "tools"],
);

const ELECTRONICS = buildAssets(
  "electronics",
  "Electronics",
  ["monitor", "keyboard", "headphones", "speaker", "camera", "smartwatch", "tablet", "mouse"],
  ["laptops", "mobiles", "tvs", "accessories", "audio", "cameras"],
);

const FOOD_BEVERAGES = buildAssets(
  "food-beverages",
  "Food & Beverages",
  ["coffee-beans", "tea-set", "juice", "cake", "sandwich", "cookies", "smoothie", "chocolate"],
  ["hot-drinks", "cold-drinks", "snacks", "bakery", "organic"],
);

const HEALTHCARE = buildAssets(
  "healthcare",
  "Healthcare",
  ["stethoscope", "medicine-box", "thermometer", "first-aid", "vitamins", "mask", "gloves", "sanitizer"],
  ["consultation", "medicines", "equipment", "wellness"],
);

const CONSTRUCTION = buildAssets(
  "construction",
  "Construction",
  ["helmet", "cement-bag", "excavator", "crane", "bricks", "drill", "level", "ladder"],
  ["cement", "steel", "tools", "paint", "safety"],
);

const RESTAURANTS = buildAssets(
  "restaurants",
  "Restaurants",
  ["pizza", "burger", "pasta", "salad", "cake", "biryani", "curry", "noodles"],
  ["starters", "mains", "desserts", "beverages"],
);

const RETAIL = buildAssets(
  "retail",
  "Retail",
  ["shopping-bag", "gift-box", "basket", "toy", "notebook", "soap", "candle", "snack-pack"],
  ["groceries", "toys", "stationery", "household", "personal-care"],
);

const HOSPITALITY = buildAssets(
  "hospitality",
  "Hospitality",
  ["room-key", "luggage", "pillow", "towel", "minibar", "toiletries", "robe", "slippers"],
  ["rooms", "dining", "spa", "events"],
);

const FASHION = buildAssets(
  "fashion",
  "Fashion",
  ["dress", "shirt", "jeans", "sneakers", "handbag", "sunglasses", "watch", "scarf"],
  ["clothing", "shoes", "bags", "accessories"],
);

const PHARMACEUTICAL = buildAssets(
  "pharmaceutical",
  "Pharmaceutical",
  ["medicine-bottle", "tablets", "syrup", "bandage", "ointment", "inhaler", "drops", "capsules"],
  ["prescription", "otc", "supplements", "personal-care"],
);

const OPTICALS = buildAssets(
  "opticals",
  "Opticals",
  ["spectacles", "aviator", "round-glasses", "lens-case", "lens-solution", "frames", "reading-glasses", "sport-glasses"],
  ["eyeglasses", "sunglasses", "contact-lenses", "accessories"],
);

const KIDS_FASHION = buildAssets(
  "kids-fashion",
  "Kids Fashion",
  ["onesie", "t-shirt", "overalls", "sneakers", "backpack", "cap", "socks", "jacket"],
  ["boys", "girls", "baby", "accessories"],
);

const MENS_FASHION = buildAssets(
  "men-fashion",
  "Men's Fashion",
  ["suit", "polo", "chinos", "loafers", "wallet", "belt", "tie", "cologne"],
  ["formal", "casual", "athletic", "accessories"],
);

const WOMENS_FASHION = buildAssets(
  "women-fashion",
  "Women's Fashion",
  ["dress", "blouse", "heels", "clutch", "earrings", "lipstick", "perfume", "scarf"],
  ["dresses", "tops", "shoes", "jewelry"],
);

// ─── 41 Personas → 14 Asset Packs ───────────────────────────

const INDUSTRY_ASSET_MAP: Record<string, IndustryAssets> = {
  // Direct matches
  automotive: AUTOMOTIVE,
  electronics: ELECTRONICS,
  food: FOOD_BEVERAGES,
  healthcare: HEALTHCARE,
  construction: CONSTRUCTION,
  restaurants: RESTAURANTS,
  retail: RETAIL,
  hospitality: HOSPITALITY,
  fashion: FASHION,
  pharmaceutical: PHARMACEUTICAL,
  opticals: OPTICALS,
  kids_fashion: KIDS_FASHION,
  men_fashion: MENS_FASHION,
  women_fashion: WOMENS_FASHION,

  // Tech-adjacent → Electronics
  technology: ELECTRONICS,
  telecom: ELECTRONICS,
  gaming: ELECTRONICS,
  media: ELECTRONICS,

  // Fashion-adjacent
  textiles: FASHION,
  cosmetics: WOMENS_FASHION,
  jewelry: WOMENS_FASHION,

  // Vehicle/transport-adjacent → Automotive
  logistics: AUTOMOTIVE,
  transportation: AUTOMOTIVE,
  maritime: AUTOMOTIVE,
  aviation: AUTOMOTIVE,
  aerospace: AUTOMOTIVE,

  // Industrial → Construction
  manufacturing: CONSTRUCTION,
  energy: CONSTRUCTION,
  renewable_energy: CONSTRUCTION,
  chemicals: CONSTRUCTION,
  mining: CONSTRUCTION,
  utilities: CONSTRUCTION,
  waste_management: CONSTRUCTION,

  // Professional/service → Retail
  education: RETAIL,
  legal: RETAIL,
  consulting: RETAIL,
  insurance: RETAIL,
  nonprofit: RETAIL,
  government: RETAIL,
  finance: RETAIL,
  publishing: RETAIL,
  packaging: RETAIL,

  // Nature/organic → Food & Beverages
  agriculture: FOOD_BEVERAGES,
  sports: FOOD_BEVERAGES,

  // Medical-adjacent → Healthcare
  veterinary: HEALTHCARE,

  // Real estate → Construction
  real_estate: CONSTRUCTION,
};

// ─── Public API ──────────────────────────────────────────────

/**
 * Get the full asset pack for an industry persona.
 * Falls back to automotive if the industry isn't mapped.
 */
export function getIndustryAssets(industryId?: string): IndustryAssets {
  if (!industryId) return AUTOMOTIVE;
  const normalized = industryId.toLowerCase().replace(/[\s-]+/g, "_");
  return INDUSTRY_ASSET_MAP[normalized] || AUTOMOTIVE;
}

/**
 * Get just the hero storefront image for an industry.
 */
export function getIndustryHero(industryId?: string): string {
  return getIndustryAssets(industryId).hero;
}

/**
 * Get a random product image for placeholder use.
 */
export function getRandomProductImage(industryId?: string): string {
  const assets = getIndustryAssets(industryId);
  const idx = Math.floor(Math.random() * assets.products.length);
  return assets.products[idx]?.image || assets.hero;
}

/**
 * Get all 14 industry asset packs (for listing/admin purposes).
 */
export function getAllIndustryAssets(): IndustryAssets[] {
  return [
    AUTOMOTIVE, ELECTRONICS, FOOD_BEVERAGES, HEALTHCARE,
    CONSTRUCTION, RESTAURANTS, RETAIL, HOSPITALITY,
    FASHION, PHARMACEUTICAL, OPTICALS,
    KIDS_FASHION, MENS_FASHION, WOMENS_FASHION,
  ];
}
