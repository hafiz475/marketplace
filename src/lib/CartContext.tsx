"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { emitCartUpdate, useCartActivity } from "./useSocket";

export interface CartItemStore {
  companyName: string;
  companySlug: string;
  profileImage: string;
  storeUrl: string;
  storeAddress: string;
  storeLocation?: { latitude: number; longitude: number };
  phoneNumber?: { countryCode: string; phoneNumber: string };
  distance: number;
  socialLinks: Record<string, string>;
}

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  taxPercentage?: number;
  currency?: string;
  type?: string;
  sku?: string;
  category?: string;
  description?: string;
  image?: string;
  industry?: string[];
  companySlug?: string;
  maxQuantity?: number;
  // Fields used by the search page cart
  salePrice?: number;
  itemType?: string;
  taxEntries?: { percentage: number }[];
  store?: CartItemStore;
  delivery?: any;
  addedAt?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (itemId: string) => number;
  /** Get the real available quantity for an item, accounting for ALL users' carts globally */
  getAvailableQuantity: (itemId: string, totalStock: number) => number;
  /** Raw server-aggregated totals: { itemId: totalQtyAcrossAllUsers } */
  reservedQuantities: Record<string, number>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Server-aggregated quantities reserved by ALL users across all devices
  const [reservedQuantities, setReservedQuantities] = useState<
    Record<string, number>
  >({});

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage");
      }
    }
  }, []);

  // Cross-tab sync: listen for changes to localStorage from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cart" && e.newValue !== null) {
        try {
          setItems(JSON.parse(e.newValue));
        } catch {
          // ignore parse errors
        }
      } else if (e.key === "cart" && e.newValue === null) {
        setItems([]);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Listen for server-aggregated cart activity (all users' carts)
  const handleCartActivity = useCallback(
    (data: { company: string; totals: Record<string, number> }) => {
      setReservedQuantities((prev) => {
        const next = { ...prev };
        // Merge totals from this company into the global map
        Object.entries(data.totals).forEach(([itemId, qty]) => {
          next[itemId] = qty;
        });
        // Remove items that are no longer in the totals for this company
        // (they were removed from all carts)
        Object.keys(prev).forEach((itemId) => {
          if (data.totals[itemId] === undefined || data.totals[itemId] === 0) {
            // Only remove if this item was from this company's context
            // Since totals only contain items for the broadcasting company,
            // we check if the item is missing from the new totals
            if (prev[itemId] !== undefined && data.totals[itemId] === 0) {
              delete next[itemId];
            }
          }
        });
        return next;
      });
    },
    [],
  );

  // Subscribe to cart:activity from all companies in our cart
  useCartActivity(handleCartActivity);

  // Use a ref to track which companies we have emitted updates to
  const emittedCompanies = React.useRef<Set<string>>(new Set());

  // Save cart to localStorage on change and emit to socket
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));

    // Group cart items by company to emit to socket
    const cartByCompany = items.reduce(
      (acc, item) => {
        const companyId = item.companySlug || item.store?.companySlug;
        if (companyId) {
          if (!acc[companyId]) acc[companyId] = [];
          acc[companyId].push({ itemId: item.itemId, quantity: item.quantity });
        }
        return acc;
      },
      {} as Record<string, { itemId: string; quantity: number }[]>,
    );

    const currentCompanies = new Set(Object.keys(cartByCompany));

    // Emit update for each company
    Object.entries(cartByCompany).forEach(([comp, compItems]) => {
      emitCartUpdate(comp, compItems);
      emittedCompanies.current.add(comp);
    });

    // If we previously emitted for a company but it's no longer in the cart, send an empty array to clear it
    emittedCompanies.current.forEach((comp) => {
      if (!currentCompanies.has(comp)) {
        emitCartUpdate(comp, []);
        emittedCompanies.current.delete(comp);
      }
    });
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      // Read fresh from localStorage to catch cross-tab writes
      let freshItems = prev;
      try {
        const stored = localStorage.getItem("cart");
        if (stored) {
          const parsed = JSON.parse(stored) as CartItem[];
          if (Array.isArray(parsed)) freshItems = parsed;
        }
      } catch {
        // fallback to in-memory state
      }

      const existing = freshItems.find((i) => i.itemId === item.itemId);
      const nowStr = new Date().toISOString();
      if (existing) {
        return freshItems.map((i) => {
          if (i.itemId === item.itemId) {
            const addedQty = item.quantity || 1;
            const newQty = i.quantity + addedQty;
            const maxQ =
              item.maxQuantity !== undefined ? item.maxQuantity : i.maxQuantity;
            const finalQty =
              maxQ !== undefined && newQty > maxQ ? maxQ : newQty;
            return {
              ...i,
              quantity: finalQty,
              maxQuantity: maxQ,
              addedAt: i.addedAt || nowStr,
            };
          }
          return i;
        });
      }
      return [...freshItems, { ...item, quantity: item.quantity || 1, addedAt: nowStr }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.itemId === itemId) {
          const maxQ = i.maxQuantity;
          const finalQty =
            maxQ !== undefined && quantity > maxQ ? maxQ : quantity;
          return { ...i, quantity: finalQty };
        }
        return i;
      }),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (itemId: string): number => {
    const item = items.find((i) => i.itemId === itemId);
    return item?.quantity || 0;
  };

  /**
   * Calculate real available quantity for an item:
   * available = totalStock - reservedByAllUsers + myOwnCartQty
   *
   * Example: stock=11, server says 6 reserved globally, current user has 3 of those 6
   * → available for this user = 11 - 6 + 3 = 8
   */
  const getAvailableQuantity = useCallback(
    (itemId: string, totalStock: number): number => {
      const serverTotal = reservedQuantities[itemId] || 0;
      const myQty = items.find((i) => i.itemId === itemId)?.quantity || 0;
      // How many are reserved by OTHER users = serverTotal - myQty
      const othersReserved = Math.max(0, serverTotal - myQty);
      // Available for this user = totalStock - othersReserved
      return Math.max(0, totalStock - othersReserved);
    },
    [reservedQuantities, items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        getAvailableQuantity,
        reservedQuantities,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
