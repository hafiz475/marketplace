"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  Suspense,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { flushSync } from "react-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiSearch,
  FiLoader,
  FiGlobe,
  FiPackage,
  FiTool,
  FiChevronDown,
  FiShoppingCart,
  FiX,
  FiSun,
  FiMoon,
  FiCalendar,
  FiTruck,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  searchProductsNearby,
  getAvailableCountries,
  getAvailableIndustries,
  getSearchSuggestions,
  detectCountry,
  getCountryData,
} from "@/lib/api";
import {
  useInventorySocket,
  emitCartUpdate,
  useCartActivity,
} from "@/lib/useSocket";
import "./search.scss";

// =============================================================================
// COUNTRY CENTERS
// =============================================================================
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629, name: "India" };

// Industry type
interface Industry {
  id: string;
  name: string;
  icon: string;
}

// Helper to fix malformed URLs (e.g., "https://https://...")
const sanitizeImageUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  // Fix duplicate https://
  let cleaned = url.replace(/^https?:\/\/https?:\/\//, "https://");
  // Must start with http
  if (!cleaned.startsWith("http")) return null;
  return cleaned;
};

// =============================================================================
// TYPES
// =============================================================================
interface Store {
  companyName: string;
  companySlug: string;
  profileImage: string;
  storeUrl: string;
  storeAddress: string;
  storeLocation?: { latitude: number; longitude: number };
  distance: number;
  phoneNumber?: { countryCode: string; phoneNumber: string };
  socialLinks: Record<string, string>;
}

interface Tag {
  name: string;
  icon: string;
}

interface Product {
  itemId: string;
  name: string;
  description: string;
  salePrice: number;
  image: string;
  images: string[];
  itemType: string;
  quantity?: number; // Added to enforce max stock
  tags: Tag[];
  currency: string;
  industry: string[];
  taxEntries: { type: string; percentage: number }[];
  store: Store;
  delivery?: {
    available?: boolean;
    national?: { enabled?: boolean; radiusKm?: number; conditions?: string };
    international?: {
      enabled?: boolean;
      countries?: { name: string; rate: string }[];
      conditions?: string;
    };
  };
}

interface SearchCartItem {
  itemId: string;
  name: string;
  salePrice: number;
  currency: string;
  image: string;
  itemType: string;
  quantity: number;
  maxQuantity?: number;
  taxEntries: { type: string; percentage: number }[];
  store: Store;
  price?: number;
}

// Per-tab data shape
interface TabData {
  items: Product[];
  allTags: Tag[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  skip: number;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================
const ProductImageCarousel = ({ product }: { product: Product }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (images.length === 0) {
    return (
      <div className="product-image">
        <div className="no-image">
          {product.itemType === "service" ? <FiTool /> : <FiPackage />}
        </div>
      </div>
    );
  }

  if (images.length === 1) {
    const imgUrl = sanitizeImageUrl(images[0]);
    return (
      <div className="product-image">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={product.name}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="no-image">
            {product.itemType === "service" ? <FiTool /> : <FiPackage />}
          </div>
        )}
      </div>
    );
  }

  const currentImgUrl = sanitizeImageUrl(images[currentIndex]);

  return (
    <div className="product-image carousel">
      {currentImgUrl ? (
        <Image
          src={currentImgUrl}
          alt={`${product.name} ${currentIndex + 1}`}
          fill
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div className="no-image">
          {product.itemType === "service" ? <FiTool /> : <FiPackage />}
        </div>
      )}
      <button
        className="carousel-btn prev"
        onClick={handlePrev}
        aria-label="Previous image"
      >
        <FiChevronLeft />
      </button>
      <button
        className="carousel-btn next"
        onClick={handleNext}
        aria-label="Next image"
      >
        <FiChevronRight />
      </button>
      <div className="carousel-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === currentIndex ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

const INITIAL_TAB_DATA: TabData = {
  items: [],
  allTags: [],
  loading: true,
  loadingMore: false,
  error: null,
  hasMore: true,
  skip: 0,
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="search-loading">
          <FiLoader className="spin" /> Loading Search...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  // Per-tab independent state
  const [productsData, setProductsData] = useState<TabData>({
    ...INITIAL_TAB_DATA,
  });
  const [servicesData, setServicesData] = useState<TabData>({
    ...INITIAL_TAB_DATA,
  });
  const [activeTab, setActiveTab] = useState<"products" | "services">(
    "products",
  );
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState<string>(
    () => searchParams.get("country")?.toUpperCase() || "",
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  const [initComplete, setInitComplete] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [locationStatus, setLocationStatus] = useState<
    "loading" | "granted" | "country"
  >("loading");

  const [countryName, setCountryName] = useState<string>("");
  const [countryCenters, setCountryCenters] = useState<
    Record<string, { lat: number; lng: number; name: string }>
  >({});
  const [cart, setCart] = useState<SearchCartItem[]>([]);
  const [cartMounted, setCartMounted] = useState(false);
  // Server-aggregated reserved quantities from ALL users/pages/devices
  const [reservedQuantities, setReservedQuantities] = useState<
    Record<string, number>
  >({});
  const [hoveredStore, setHoveredStore] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [deliveryModal, setDeliveryModal] = useState<Product | null>(null);
  const LIMIT = 24;
  const MAX_RADIUS = 5000; // 5000 km radius

  // Convenience: get the active tab's data
  const activeData = activeTab === "products" ? productsData : servicesData;

  // Dynamic industries from backend
  const [industries, setIndustries] = useState<Industry[]>([]);

  // Build INDUSTRY_MAP dynamically
  const industryMap = useMemo(() => {
    return Object.fromEntries([
      ...industries.map((ind) => [ind.id, ind]),
      ...industries.map((ind) => [ind.name.toLowerCase(), ind]),
    ]);
  }, [industries]);

  // Industry multi-select (start empty, populated after fetch)
  const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(
    () => new Set(),
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<
    {
      name: string;
      itemType: string;
      store: string;
      industry: string[];
      tags: { name: string; icon: string }[];
    }[]
  >([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const suggestionsTimer = useRef<NodeJS.Timeout | null>(null);

  // Country filter
  const [availableCountries, setAvailableCountries] = useState<
    { iso2: string; name: string }[]
  >([]);
  const [userIso2, setUserIso2] = useState<string>("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySearchRef = useRef<HTMLInputElement>(null);

  // Ref to hold pending industry selection (from suggestion clicks)
  const pendingIndustrySelection = useRef<Set<string> | null>(null);

  // Cache the "home" state to restore instantly on back (Instagram-style)
  const cachedHomeState = useRef<{
    productsData: TabData;
    servicesData: TabData;
    selectedIndustries: Set<string>;
    scrollY: number;
  } | null>(null);
  // Flag to skip the next re-fetch triggered by selectedTag change
  const skipNextFetch = useRef<boolean>(false);

  // Filter industries shown in the top bar based on the currently selected tag
  const displayedIndustries = useMemo(() => {
    if (!selectedTag) return industries;
    const relevantIds = new Set<string>();
    activeData.items.forEach((p) => {
      p.industry?.forEach((indName) => {
        const resolved = industryMap[indName.toLowerCase()];
        if (resolved) relevantIds.add(resolved.id);
      });
    });
    return industries.filter((ind) => relevantIds.has(ind.id));
  }, [selectedTag, industries, activeData.items, industryMap]);

  const allIndustriesSelected =
    displayedIndustries.length > 0 &&
    displayedIndustries.every((ind) => selectedIndustries.has(ind.id));

  // Auto-select relevant industries when a tag is activated
  useEffect(() => {
    if (selectedTag && displayedIndustries.length > 0) {
      setSelectedIndustries(new Set(displayedIndustries.map((ind) => ind.id)));
    }
  }, [selectedTag, displayedIndustries.length]);

  const toggleIndustry = (id: string) => {
    setSelectedIndustries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllIndustries = () => {
    if (allIndustriesSelected) {
      setSelectedIndustries(new Set());
    } else {
      setSelectedIndustries(new Set(displayedIndustries.map((i) => i.id)));
    }
  };

  // Get country code from localStorage
  const getUserCountryCode = (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        return user?.phoneNumber?.countryCode || null;
      }
    } catch (e) {
      console.error("Error reading user data:", e);
    }
    return null;
  };

  const getCountryCenter = (code: string | null) => {
    if (!code) return DEFAULT_CENTER;
    return countryCenters[code] || DEFAULT_CENTER;
  };

  // 1. Fetch country data mapping on mount
  useEffect(() => {
    getCountryData()
      .then((data) => {
        if (data.success) {
          setCountryCenters(data.countryData);
        }
      })
      .catch(console.error);

    // Fetch available countries (doesn't depend on coordinates)
    getAvailableCountries()
      .then((data) => {
        if (data.success) {
          setAvailableCountries(data.countries);
        }
      })
      .catch(console.error);
  }, []);

  // 2. Main initialization effect: handle geo and initial country from centers
  useEffect(() => {
    // Wait for country centers to be loaded before any coordinate-dependent logic
    if (Object.keys(countryCenters).length === 0) return;

    const urlCountry = searchParams.get("country")?.toUpperCase();
    if (urlCountry) {
      const center = countryCenters[urlCountry] || DEFAULT_CENTER;
      setSelectedCountry(urlCountry);
      setUserLocation({ lat: center.lat, lng: center.lng });
      setCountryName(center.name);
      setLocationStatus("country");
      setInitComplete(true);
      return;
    }

    if (!navigator.geolocation) {
      const countryCode = getUserCountryCode();
      const center = getCountryCenter(countryCode);
      setUserLocation({ lat: center.lat, lng: center.lng });
      setCountryName(center.name);
      setLocationStatus("country");
      // Try to detect country from center coords
      detectCountry(center.lat, center.lng)
        .then((data) => {
          if (data.success && data.country) {
            setSelectedCountry(data.country.iso2);
            setCountryName(data.country.name);
          }
        })
        .catch(console.error)
        .finally(() => setInitComplete(true));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        setLocationStatus("granted");
        // Auto-detect country from user's real location
        detectCountry(lat, lng)
          .then((data) => {
            if (data.success && data.country) {
              setSelectedCountry(data.country.iso2);
              setCountryName(data.country.name);
            }
          })
          .catch(console.error)
          .finally(() => setInitComplete(true));
      },
      () => {
        const countryCode = getUserCountryCode();
        const center = getCountryCenter(countryCode);
        setUserLocation({ lat: center.lat, lng: center.lng });
        setCountryName(center.name);
        setLocationStatus("country");
        detectCountry(center.lat, center.lng)
          .then((data) => {
            if (data.success && data.country) {
              setSelectedCountry(data.country.iso2);
              setCountryName(data.country.name);
            }
          })
          .catch(console.error)
          .finally(() => setInitComplete(true));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [countryCenters, searchParams]);

  // Fetch available industries from actual inventory — re-fetch when country or tab changes
  useEffect(() => {
    if (!initComplete) return;

    const itemType = activeTab === "products" ? "product" : "service";
    getAvailableIndustries(selectedCountry || undefined, itemType)
      .then((data) => {
        if (data.success && data.industries) {
          setIndustries(data.industries);
          // If a suggestion click set a pending selection, apply it instead of selecting all
          if (pendingIndustrySelection.current) {
            setSelectedIndustries(pendingIndustrySelection.current);
            pendingIndustrySelection.current = null;
          } else {
            // Default: select all fetched industries
            setSelectedIndustries(
              new Set(data.industries.map((i: Industry) => i.id)),
            );
          }
        }
      })
      .catch(console.error);
  }, [initComplete, selectedCountry, activeTab]);

  // Fetch items for a specific tab type
  const fetchItems = useCallback(
    async (type: "product" | "service", reset = false) => {
      if (!userLocation) return;

      const setter = type === "product" ? setProductsData : setServicesData;
      const currentData = type === "product" ? productsData : servicesData;

      try {
        if (reset) {
          setter((prev) => ({ ...prev, loading: true, error: null, skip: 0 }));
        } else {
          setter((prev) => ({ ...prev, loadingMore: true }));
        }

        const currentSkip = reset ? 0 : currentData.skip;

        // Build industry param — send names (not IDs) so backend regex can match DB values
        let industryParam = "";
        if (!allIndustriesSelected) {
          const selectedNames = industries
            .filter((ind) => selectedIndustries.has(ind.id))
            .map((ind) => ind.name);
          industryParam = selectedNames.join(",");
        }

        const data = await searchProductsNearby({
          lat: userLocation.lat,
          lng: userLocation.lng,
          maxRadius: MAX_RADIUS,
          tag: selectedTag,
          search: searchQuery,
          industry: industryParam,
          country: selectedCountry,
          itemType: type,
          limit: LIMIT,
          skip: currentSkip,
        });

        if (data.success) {
          setter((prev) => ({
            ...prev,
            items: reset ? data.products : [...prev.items, ...data.products],
            allTags: data.allTags || [],
            hasMore: data.hasMore,
            skip: currentSkip + LIMIT,
          }));
        }
      } catch (err) {
        console.error(`Search error (${type}):`, err);
        setter((prev) => ({
          ...prev,
          error: `Failed to load ${type}s. Please try again.`,
        }));
      } finally {
        setter((prev) => ({ ...prev, loading: false, loadingMore: false }));
      }
    },
    [
      userLocation,
      selectedTag,
      searchQuery,
      productsData.skip,
      servicesData.skip,
      selectedIndustries,
      allIndustriesSelected,
      selectedCountry,
    ],
  );

  // Re-fetch both tabs when shared filters change
  useEffect(() => {
    if (initComplete && userLocation) {
      if (skipNextFetch.current) {
        skipNextFetch.current = false;
        return; // skip — data was restored from cache
      }
      fetchItems("product", true);
      fetchItems("service", true);
    }
  }, [initComplete, userLocation, selectedTag, selectedCountry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems("product", true);
    fetchItems("service", true);
  };

  const loadMore = () => {
    const type = activeTab === "products" ? "product" : "service";
    if (!activeData.loadingMore && activeData.hasMore) {
      fetchItems(type, false);
    }
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("search-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    setCartMounted(true);
  }, []);

  const emittedCompanies = React.useRef<Set<string>>(new Set());

  // Watch for cart changes and sync with localStorage AND Socket.io
  useEffect(() => {
    if (cartMounted) {
      localStorage.setItem("search-cart", JSON.stringify(cart));

      // Group cart items by company to emit to socket
      const cartByCompany = cart.reduce(
        (acc, item) => {
          const companyId = item.store?.companySlug;
          if (companyId) {
            if (!acc[companyId]) acc[companyId] = [];
            acc[companyId].push({
              itemId: item.itemId,
              quantity: item.quantity,
            });
          }
          return acc;
        },
        {} as Record<string, { itemId: string; quantity: number }[]>,
      );

      const currentCompanies = new Set(Object.keys(cartByCompany));

      Object.entries(cartByCompany).forEach(([comp, items]) => {
        emitCartUpdate(comp, items);
        emittedCompanies.current.add(comp);
      });

      emittedCompanies.current.forEach((comp) => {
        if (!currentCompanies.has(comp)) {
          emitCartUpdate(comp, []);
          emittedCompanies.current.delete(comp);
        }
      });
    }
  }, [cart, cartMounted]);

  // Listen for server-aggregated cart activity (totals across ALL users/devices)
  const handleCartActivity = useCallback(
    (data: { company: string; totals: Record<string, number> }) => {
      setReservedQuantities((prev) => {
        const next = { ...prev };
        Object.entries(data.totals).forEach(([itemId, qty]) => {
          next[itemId] = qty;
        });
        return next;
      });
    },
    [],
  );
  useCartActivity(handleCartActivity);

  // Get available quantity for an item, accounting for all users' reservations
  const getAvailableQuantity = useCallback(
    (itemId: string, totalStock: number): number => {
      const serverTotal = reservedQuantities[itemId] || 0;
      const myQty = cart.find((c) => c.itemId === itemId)?.quantity || 0;
      const othersReserved = Math.max(0, serverTotal - myQty);
      return Math.max(0, totalStock - othersReserved);
    },
    [reservedQuantities, cart],
  );

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCartQty = (itemId: string) => {
    return cart.find((c) => c.itemId === itemId)?.quantity || 0;
  };

  const addToCart = (product: Product) => {
    const availableQty =
      product.itemType !== "service" && product.quantity !== undefined
        ? getAvailableQuantity(product.itemId, product.quantity)
        : undefined;
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === product.itemId);
      if (existing) {
        return prev.map((c) => {
          if (c.itemId === product.itemId) {
            const newQty = c.quantity + 1;
            const maxQ =
              availableQty !== undefined ? availableQty : product.quantity;
            const finalQty =
              maxQ !== undefined && newQty > maxQ ? maxQ : newQty;
            return { ...c, quantity: finalQty, maxQuantity: maxQ };
          }
          return c;
        });
      }
      return [
        ...prev,
        {
          itemId: product.itemId,
          name: product.name,
          salePrice: product.salePrice,
          currency: product.currency,
          image: product.image,
          itemType: product.itemType,
          quantity: 1,
          maxQuantity:
            availableQty !== undefined ? availableQty : product.quantity,
          taxEntries: product.taxEntries || [],
          store: product.store,
          delivery: product.delivery,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === itemId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((c) =>
          c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c,
        );
      }
      return prev.filter((c) => c.itemId !== itemId);
    });
  };

  // Debounced search suggestions from API
  const fetchSuggestions = useCallback(
    (query: string) => {
      if (suggestionsTimer.current) {
        clearTimeout(suggestionsTimer.current);
      }
      if (!query || query.length < 2) {
        setSuggestions([]);
        return;
      }
      suggestionsTimer.current = setTimeout(async () => {
        try {
          const data = await getSearchSuggestions(query, selectedCountry);
          if (data.success) {
            setSuggestions(data.suggestions);
          }
        } catch (err) {
          console.error("Suggestions error:", err);
        }
      }, 300);
    },
    [selectedCountry],
  );

  const handleSuggestionClick = (
    name: string,
    itemType: string,
    suggestionIndustries: string[],
  ) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    // Switch to the correct tab based on the item type
    const targetTab = itemType === "service" ? "services" : "products";
    // Build the targeted industry selection BEFORE changing tab
    if (suggestionIndustries && suggestionIndustries.length > 0) {
      const matchedIds = new Set<string>();
      suggestionIndustries.forEach((ind) => {
        const key = ind.toLowerCase();
        const resolved = industryMap[key];
        if (resolved) {
          matchedIds.add(resolved.id);
        } else {
          matchedIds.add(
            key.replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, ""),
          );
        }
      });
      // Store in ref so the useEffect picks it up instead of selecting all
      pendingIndustrySelection.current = matchedIds;
      setSelectedIndustries(matchedIds);
    }
    setActiveTab(targetTab);
    fetchItems(itemType === "service" ? "service" : "product", true);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Re-fetch when industries change (debounced)
  const industryTimer = useRef<NodeJS.Timeout | null>(null);
  // Need a separate skip flag for industries to prevent racing with the main skip flag
  const skipIndustryFetch = useRef<boolean>(false);

  useEffect(() => {
    if (!userLocation) return;

    // If the back button triggered an industry reset, skip this fetch
    if (skipIndustryFetch.current) {
      skipIndustryFetch.current = false;
      return;
    }

    if (industryTimer.current) clearTimeout(industryTimer.current);
    industryTimer.current = setTimeout(() => {
      fetchItems("product", true);
      fetchItems("service", true);
    }, 400);
    return () => {
      if (industryTimer.current) clearTimeout(industryTimer.current);
    };
  }, [selectedIndustries]);

  // ───── Socket.io: Live inventory updates ─────
  const handleSocketUpdate = useCallback(
    (data: { itemId: string; company: string; quantity: number }) => {
      // Patch quantity in products tab
      setProductsData((prev) => ({
        ...prev,
        items: prev.items.map((p) =>
          p.itemId === data.itemId ? { ...p, quantity: data.quantity } : p,
        ),
      }));
      // Patch quantity in services tab
      setServicesData((prev) => ({
        ...prev,
        items: prev.items.map((p) =>
          p.itemId === data.itemId ? { ...p, quantity: data.quantity } : p,
        ),
      }));
    },
    [],
  );

  useInventorySocket(handleSocketUpdate);

  // Group items by industry — reads from the active tab's data
  const industryGroups = useMemo(() => {
    const items = activeData.items;

    const groups: {
      industry: { id: string; name: string; icon: string };
      products: Product[];
      tags: Tag[];
    }[] = [];

    // Collect items per industry
    const industryProductMap = new Map<string, Product[]>();
    const uncategorized: Product[] = [];

    items.forEach((product) => {
      if (product.industry && product.industry.length > 0) {
        product.industry.forEach((ind) => {
          const key = ind.toLowerCase();
          const resolved = industryMap[key];
          const canonicalKey = resolved ? resolved.id : key;
          if (!industryProductMap.has(canonicalKey)) {
            industryProductMap.set(canonicalKey, []);
          }
          industryProductMap.get(canonicalKey)!.push(product);
        });
      } else {
        uncategorized.push(product);
      }
    });

    // Build groups in the order of industries (only selected ones)
    industries.forEach((ind) => {
      if (!selectedIndustries.has(ind.id)) return;
      const prods = industryProductMap.get(ind.id);
      if (prods && prods.length > 0) {
        const tagMap = new Map<string, string>();
        prods.forEach((p) => {
          p.tags.forEach((t) => {
            if (!tagMap.has(t.name)) tagMap.set(t.name, t.icon);
          });
        });
        groups.push({
          industry: ind,
          products: prods,
          tags: Array.from(tagMap.entries()).map(([name, icon]) => ({
            name,
            icon,
          })),
        });
      }
    });

    // Handle any industries not in the predefined list
    industryProductMap.forEach((prods, key) => {
      if (!industryMap[key]) {
        const tagMap = new Map<string, string>();
        prods.forEach((p) => {
          p.tags.forEach((t) => {
            if (!tagMap.has(t.name)) tagMap.set(t.name, t.icon);
          });
        });
        groups.push({
          industry: {
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            icon: "🏢",
          },
          products: prods,
          tags: Array.from(tagMap.entries()).map(([name, icon]) => ({
            name,
            icon,
          })),
        });
      }
    });

    // Uncategorized at the end
    if (uncategorized.length > 0) {
      const tagMap = new Map<string, string>();
      uncategorized.forEach((p) => {
        p.tags.forEach((t) => {
          if (!tagMap.has(t.name)) tagMap.set(t.name, t.icon);
        });
      });
      groups.push({
        industry: { id: "other", name: "Other", icon: "📦" },
        products: uncategorized,
        tags: Array.from(tagMap.entries()).map(([name, icon]) => ({
          name,
          icon,
        })),
      });
    }

    return groups;
  }, [activeData.items, selectedIndustries, industries, industryMap]);

  return (
    <div className="search-page">
      {/* Fixed top navbar */}
      <nav className="top-navbar">
        <Link href="/" className="back-btn">
          <FiArrowLeft />
        </Link>
        <span className="brand-name">CirclTrade</span>
        <div className="navbar-actions">
          <Link
            href="/search/cart"
            className="appointment-nav-icon"
            title="Appointments & Cart"
          >
            <FiCalendar />
            {totalCartItems > 0 && (
              <span className="appointment-badge">{totalCartItems}</span>
            )}
          </Link>
          <button
            className="theme-toggle"
            onClick={() => {
              const next = !isDarkMode;
              setIsDarkMode(next);
              document.body.classList.toggle("light-mode", !next);
            }}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="search-header">
        <div className="search-row">
          <div className="search-form-wrapper" ref={searchRef}>
            <form className="search-form" onSubmit={handleSearch}>
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products near you..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  fetchSuggestions(e.target.value);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                    // If tag is active, clear it
                    if (selectedTag) setSelectedTag("");
                    // Reset all industries to selected
                    setSelectedIndustries(new Set(industries.map((i) => i.id)));
                    // Re-fetch for current active tab
                    fetchItems(
                      activeTab === "products" ? "product" : "service",
                      true,
                    );
                  }}
                >
                  <FiX />
                </button>
              )}
            </form>
            {/* Autocomplete suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.name}-${i}`}
                    className="suggestion-item"
                    onClick={() =>
                      handleSuggestionClick(s.name, s.itemType, s.industry)
                    }
                  >
                    {s.itemType === "service" ? (
                      <FiTool className="suggestion-icon" />
                    ) : (
                      <FiPackage className="suggestion-icon" />
                    )}
                    <div className="suggestion-text">
                      <span className="suggestion-name">{s.name}</span>
                      <span className="suggestion-meta">
                        {s.industry?.length > 0 && (
                          <span className="suggestion-industry">
                            {industryMap[s.industry[0]?.toLowerCase()]?.icon ||
                              "🏢"}{" "}
                            {industryMap[s.industry[0]?.toLowerCase()]?.name ||
                              s.industry[0]}
                          </span>
                        )}
                        {s.tags?.length > 0 && (
                          <span className="suggestion-tags">
                            {s.tags.map((t) => (
                              <span key={t.name} className="suggestion-tag">
                                {t.icon || "🏷️"} {t.name}
                              </span>
                            ))}
                          </span>
                        )}
                      </span>
                      <span className="suggestion-store">{s.store}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Country picker — inline in header */}
          {availableCountries.length > 0 && (
            <div className="country-picker" ref={countryDropdownRef}>
              <button
                className="country-picker-trigger"
                onClick={() => {
                  setShowCountryDropdown((p) => !p);
                  setCountrySearch("");
                }}
              >
                {selectedCountry ? (
                  <>
                    <img
                      src={`https://flagcdn.com/${selectedCountry.toLowerCase()}.svg`}
                      alt=""
                      className="country-flag"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="country-label">
                      {availableCountries.find(
                        (c) => c.iso2 === selectedCountry,
                      )?.name || selectedCountry}
                    </span>
                  </>
                ) : (
                  <span className="country-label">Select Country</span>
                )}
                <FiChevronDown
                  className={`country-arrow ${showCountryDropdown ? "open" : ""}`}
                />
              </button>
              {showCountryDropdown && (
                <div className="country-picker-dropdown">
                  <input
                    ref={countrySearchRef}
                    type="text"
                    placeholder="Search country..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="country-picker-search"
                    autoFocus
                  />
                  <ul className="country-picker-list">
                    {availableCountries
                      .filter(
                        (c) =>
                          c.name
                            .toLowerCase()
                            .includes(countrySearch.toLowerCase()) ||
                          c.iso2
                            .toLowerCase()
                            .includes(countrySearch.toLowerCase()),
                      )
                      .map((c) => (
                        <li
                          key={c.iso2}
                          className={`country-picker-item ${selectedCountry === c.iso2 ? "active" : ""}`}
                          onClick={() => {
                            setSelectedCountry(c.iso2);
                            setShowCountryDropdown(false);
                            setCountrySearch("");
                          }}
                        >
                          <img
                            src={`https://flagcdn.com/${c.iso2.toLowerCase()}.svg`}
                            alt={`${c.name} flag`}
                            className="country-flag"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                          <span className="country-name">{c.name}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Filter bar: type toggle + industries */}
      <div className="filter-bar">
        {(selectedTag || !allIndustriesSelected) && (
          <button
            className="back-btn-integrated"
            title="Back to All Products"
            onClick={() => {
              if (selectedTag && cachedHomeState.current) {
                // Instantly restore cached home state (Instagram-style)
                const scrollTarget = cachedHomeState.current.scrollY;

                // Use flushSync to force React to render the restored DOM synchronously
                flushSync(() => {
                  skipNextFetch.current = true;
                  skipIndustryFetch.current = true;
                  skipIndustryFetch.current = true;
                  skipIndustryFetch.current = true;
                  skipIndustryFetch.current = true;
                  setProductsData(cachedHomeState.current!.productsData);
                  setServicesData(cachedHomeState.current!.servicesData);
                  setSelectedTag("");
                  setSelectedIndustries(
                    new Set(cachedHomeState.current!.selectedIndustries),
                  );
                });

                // Now the DOM is guaranteed to have the correct height
                window.scrollTo({ top: scrollTarget, behavior: "instant" });
                cachedHomeState.current = null;
              } else if (selectedTag) {
                setSelectedTag("");
                setSelectedIndustries(new Set(industries.map((i) => i.id)));
              } else {
                // Only local industry filters changed, just reset them
                setSelectedIndustries(new Set(industries.map((i) => i.id)));
              }
            }}
          >
            <FiArrowLeft />
          </button>
        )}
        <div className="type-toggle">
          <button
            className={`type-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
            disabled={
              (!!searchQuery || !!selectedTag) && activeTab !== "products"
            }
            title="Products"
          >
            📦
          </button>
          <button
            className={`type-btn ${activeTab === "services" ? "active" : ""}`}
            onClick={() => setActiveTab("services")}
            disabled={
              (!!searchQuery || !!selectedTag) && activeTab !== "services"
            }
            title="Services"
          >
            🛠️
          </button>
        </div>
        <div className="industry-scroll">
          <button
            className={`industry-chip ${allIndustriesSelected ? "active" : ""}`}
            onClick={toggleAllIndustries}
          >
            🏭 All
          </button>
          {displayedIndustries.map((ind) => (
            <button
              key={ind.id}
              id={`ind-${ind.id}`}
              className={`industry-chip ${selectedIndustries.has(ind.id) ? "active" : ""}`}
              onClick={() => toggleIndustry(ind.id)}
            >
              {ind.icon} {ind.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {/* Persistence Back Button */}

      <main className="search-content">
        {activeData.loading ? (
          <div className="loading-state">
            <FiLoader className="spinner" />
            <p>
              Finding {activeTab === "products" ? "products" : "services"} near
              you...
            </p>
          </div>
        ) : activeData.error ? (
          <div className="error-state">
            <p>{activeData.error}</p>
            <button
              onClick={() =>
                fetchItems(
                  activeTab === "products" ? "product" : "service",
                  true,
                )
              }
            >
              Try Again
            </button>
          </div>
        ) : activeData.items.length === 0 ? (
          <div className="empty-state">
            <p>
              No {activeTab === "products" ? "products" : "services"} found
              within {MAX_RADIUS}km.
            </p>
            <p className="hint">Try a different search or check back later!</p>
          </div>
        ) : (
          <>
            {/* Industry-Grouped Sections */}
            {industryGroups.map((group) => (
              <section key={group.industry.id} className="industry-section">
                <div className="industry-header">
                  <span className="industry-icon">{group.industry.icon}</span>
                  <h2 className="industry-name">{group.industry.name}</h2>
                  <span className="industry-count">
                    {group.products.length} items
                  </span>
                </div>

                {/* Industry tags */}
                {group.tags.length > 0 && (
                  <div className="industry-tags">
                    {group.tags.map((tag) => {
                      const tagId = `tag-${group.industry.id}-${tag.name.replace(/\s+/g, "-")}`;
                      return (
                        <button
                          key={tag.name}
                          id={tagId}
                          className={`industry-tag-chip ${selectedTag === tag.name ? "active" : ""}`}
                          onClick={() => {
                            if (selectedTag !== tag.name) {
                              // Cache current state before switching to tag view
                              if (!selectedTag) {
                                cachedHomeState.current = {
                                  productsData,
                                  servicesData,
                                  selectedIndustries: new Set(
                                    selectedIndustries,
                                  ),
                                  scrollY: window.scrollY,
                                };
                              }
                              // Instant UI feedback: set loading and clear items
                              flushSync(() => {
                                skipIndustryFetch.current = true;
                                setProductsData((prev) => ({
                                  ...prev,
                                  loading: true,
                                  items: [],
                                }));
                                setServicesData((prev) => ({
                                  ...prev,
                                  loading: true,
                                  items: [],
                                }));
                                setSelectedTag(tag.name);
                              });
                              window.scrollTo({ top: 0, behavior: "instant" });
                            } else {
                              // Deselect tag — restore cached state instantly
                              if (cachedHomeState.current) {
                                const scrollTarget =
                                  cachedHomeState.current.scrollY;

                                flushSync(() => {
                                  skipNextFetch.current = true;
                                  setProductsData(
                                    cachedHomeState.current!.productsData,
                                  );
                                  setServicesData(
                                    cachedHomeState.current!.servicesData,
                                  );
                                  setSelectedTag("");
                                  setSelectedIndustries(
                                    new Set(
                                      cachedHomeState.current!
                                        .selectedIndustries,
                                    ),
                                  );
                                });

                                window.scrollTo({
                                  top: scrollTarget,
                                  behavior: "instant",
                                });
                                cachedHomeState.current = null;
                              } else {
                                setSelectedTag("");
                                setSelectedIndustries(
                                  new Set(industries.map((i) => i.id)),
                                );
                              }
                            }
                          }}
                        >
                          {tag.icon || "🏷️"} {tag.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="products-grid">
                  {group.products.map((product) => (
                    <div
                      key={`${group.industry.id}-${product.store.companyName}-${product.itemId}`}
                      className="product-card-full"
                      onMouseEnter={() =>
                        setHoveredStore({
                          lat: product.store.storeLocation?.latitude || 0,
                          lng: product.store.storeLocation?.longitude || 0,
                          name: product.store.companyName,
                        })
                      }
                      onMouseLeave={() => setHoveredStore(null)}
                    >
                      {/* Store header — top of card */}
                      <div className="card-store-header">
                        <div className="card-store-left">
                          <div className="store-avatar-small">
                            {(() => {
                              const imgUrl = sanitizeImageUrl(
                                product.store.profileImage,
                              );
                              return imgUrl ? (
                                <Image
                                  src={imgUrl}
                                  alt={product.store.companyName}
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              ) : (
                                <span>
                                  {product.store.companyName.charAt(0)}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="card-store-info">
                            <span className="store-name">
                              {product.store.companyName}
                            </span>
                            {product.store.storeAddress && (
                              <a
                                href={`https://www.google.com/maps?q=${product.store.storeLocation?.latitude || 0},${product.store.storeLocation?.longitude || 0}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card-store-address"
                              >
                                <FiMapPin />{" "}
                                {product.store.storeAddress.split("\n")[0]}
                              </a>
                            )}
                          </div>
                        </div>
                        <span className="distance-badge">
                          {product.store.distance} km
                        </span>
                      </div>

                      <div className="product-image-wrapper">
                        <Link
                          href={`${product.store.storeUrl}/${product.itemId}`}
                          className="product-image-link"
                        >
                          <ProductImageCarousel product={product} />
                        </Link>

                        {/* Delivery trigger icon next to image */}
                        {product.delivery?.available && (
                          <button
                            className="delivery-trigger-icon"
                            title="View Delivery Info"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeliveryModal(product);
                            }}
                          >
                            <FiTruck />
                          </button>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="product-details">
                        <Link
                          href={`${product.store.storeUrl}/${product.itemId}`}
                        >
                          <h3 className="product-name">{product.name}</h3>
                        </Link>
                        <p className="product-price">
                          {product.currency}
                          {product.salePrice.toLocaleString()}
                        </p>
                        {product.taxEntries &&
                          product.taxEntries.length > 0 &&
                          (() => {
                            const taxPct = product.taxEntries.reduce(
                              (s, e) => s + e.percentage,
                              0,
                            );
                            const taxAmt = Math.round(
                              (product.salePrice * taxPct) / 100,
                            );
                            const grandTotal = product.salePrice + taxAmt;
                            return (
                              <div className="tax-badges">
                                {product.taxEntries.map((entry, idx) => (
                                  <span key={idx} className="tax-badge">
                                    {entry.type} {entry.percentage}%
                                  </span>
                                ))}
                                <div className="tax-grand-total">
                                  {product.currency}
                                  {grandTotal.toLocaleString()}{" "}
                                  <span className="incl-label">
                                    incl. {product.currency}
                                    {taxAmt.toLocaleString()} tax
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                      </div>

                      {/* Cart limit warning */}
                      {(() => {
                        const availableQty =
                          product.itemType !== "service" &&
                          product.quantity !== undefined
                            ? getAvailableQuantity(
                                product.itemId,
                                product.quantity,
                              )
                            : undefined;
                        return product.itemType !== "service" &&
                          availableQty !== undefined &&
                          getCartQty(product.itemId) >= availableQty ? (
                          <div
                            className="cart-limit-reached"
                            style={{
                              color: "#ef4444",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              padding: "0 1rem",
                              marginBottom: "-0.25rem",
                              textAlign: "right",
                              width: "100%",
                            }}
                          >
                            Available stock ({availableQty})
                          </div>
                        ) : null;
                      })()}

                      {/* Cart Button */}
                      {(() => {
                        const availableQty =
                          product.itemType !== "service" &&
                          product.quantity !== undefined
                            ? getAvailableQuantity(
                                product.itemId,
                                product.quantity,
                              )
                            : undefined;
                        const isMaxed =
                          product.itemType !== "service" &&
                          availableQty !== undefined &&
                          getCartQty(product.itemId) >= availableQty;
                        return (
                          <div className="cart-row">
                            <button
                              className="cart-btn"
                              disabled={isMaxed}
                              style={{ opacity: isMaxed ? 0.5 : 1 }}
                              onClick={() => {
                                if (isMaxed) return;
                                addToCart(product);
                              }}
                            >
                              {getCartQty(product.itemId) ? (
                                <span className="cart-count">
                                  {getCartQty(product.itemId)} in cart
                                </span>
                              ) : (
                                <span>+ Add to Cart</span>
                              )}
                            </button>
                            {getCartQty(product.itemId) > 0 && (
                              <button
                                className="cart-remove-btn"
                                onClick={() => removeFromCart(product.itemId)}
                              >
                                −
                              </button>
                            )}
                          </div>
                        );
                      })()}

                      {/* Visit Store */}
                      <div className="visit-store-row">
                        <a
                          href={product.store.storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="visit-store-btn"
                        >
                          <FiGlobe /> Visit Store
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Load More */}
            {activeData.hasMore && (
              <button
                className="load-more-btn"
                onClick={loadMore}
                disabled={activeData.loadingMore}
              >
                {activeData.loadingMore ? (
                  <>
                    <FiLoader className="spinner" /> Loading...
                  </>
                ) : (
                  <>
                    <FiChevronDown /> Load More{" "}
                    {activeTab === "products" ? "Products" : "Services"}
                  </>
                )}
              </button>
            )}
          </>
        )}
      </main>

      {/* Delivery Info Modal */}
      {deliveryModal && (
        <div
          className="delivery-modal-overlay"
          onClick={() => setDeliveryModal(null)}
        >
          <div className="delivery-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="delivery-modal-close"
              onClick={() => setDeliveryModal(null)}
            >
              ×
            </button>
            <h3>
              <FiTruck /> Delivery Info
            </h3>
            <p className="delivery-modal-product">{deliveryModal.name}</p>
            {deliveryModal.delivery?.national?.enabled && (
              <div className="delivery-modal-section">
                <h4>🏠 National Delivery</h4>
                <p>
                  <strong>Radius:</strong>{" "}
                  {deliveryModal.delivery.national.radiusKm
                    ? `${deliveryModal.delivery.national.radiusKm} km`
                    : "All across the state"}
                </p>
                {deliveryModal.delivery.national.conditions && (
                  <p className="delivery-conditions">
                    {deliveryModal.delivery.national.conditions}
                  </p>
                )}
              </div>
            )}
            {deliveryModal.delivery?.international?.enabled && (
              <div className="delivery-modal-section">
                <h4>🌍 International Delivery</h4>
                {(deliveryModal.delivery.international.countries?.length ?? 0) >
                  0 && (
                  <div className="delivery-country-table">
                    <div className="dct-header">
                      <span>Country</span>
                      <span>Rate</span>
                    </div>
                    {deliveryModal.delivery.international.countries!.map(
                      (c, i) => (
                        <div key={i} className="dct-row">
                          <span>{c.name}</span>
                          <span>{c.rate || "—"}</span>
                        </div>
                      ),
                    )}
                  </div>
                )}
                {deliveryModal.delivery.international.conditions && (
                  <p className="delivery-conditions">
                    {deliveryModal.delivery.international.conditions}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Cart Icon */}
      {totalCartItems > 0 && (
        <Link href="/search/cart" className="floating-cart">
          <FiShoppingCart />
          <span className="floating-cart-badge">{totalCartItems}</span>
        </Link>
      )}
    </div>
  );
}
