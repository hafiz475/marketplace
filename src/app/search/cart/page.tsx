"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiArrowLeft,
  FiMapPin,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingCart,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { emitCartUpdate, useCartActivity } from "@/lib/useSocket";
import { createAppointment } from "@/lib/api";
import DeliveryMap from "@/components/DeliveryMap/DeliveryMap";
import "./cart.scss";

interface Store {
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

// Sanitize image URL
const sanitizeImageUrl = (url: string | undefined): string | null => {
  if (!url) return null;
  let cleaned = url.replace(/^https?:\/\/https?:\/\//, "https://");
  if (!cleaned.startsWith("http")) return null;
  return cleaned;
};

export default function CartPage() {
  const [cart, setCart] = useState<SearchCartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [reservedQuantities, setReservedQuantities] = useState<
    Record<string, number>
  >({});
  // Per-store appointment/delivery scheduling
  const [appointmentDates, setAppointmentDates] = useState<
    Record<string, string>
  >({});
  const [appointmentTimes, setAppointmentTimes] = useState<
    Record<string, string>
  >({});
  const [deliveryModes, setDeliveryModes] = useState<
    Record<string, "appointment" | "delivery">
  >({});
  const [deliveryAddresses, setDeliveryAddresses] = useState<
    Record<string, string>
  >({});
  const [deliverySubModes, setDeliverySubModes] = useState<
    Record<string, "national" | "international">
  >({});
  const [submittingStore, setSubmittingStore] = useState<string | null>(null);

  // Load from search-cart localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("search-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  const emittedCompanies = React.useRef<Set<string>>(new Set());

  // Sync cart to localStorage and socket
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("search-cart", JSON.stringify(cart));

    const cartByCompany = cart.reduce(
      (acc, item) => {
        const companyId = item.store?.companySlug;
        if (companyId) {
          if (!acc[companyId]) acc[companyId] = [];
          acc[companyId].push({ itemId: item.itemId, quantity: item.quantity });
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
  }, [cart, mounted]);

  // Listen for server-aggregated cart activity
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

  // Get available quantity for an item
  const getAvailableQuantity = useCallback(
    (itemId: string, totalStock: number): number => {
      const serverTotal = reservedQuantities[itemId] || 0;
      const myQty = cart.find((c) => c.itemId === itemId)?.quantity || 0;
      const othersReserved = Math.max(0, serverTotal - myQty);
      return Math.max(0, totalStock - othersReserved);
    },
    [reservedQuantities, cart],
  );

  const updateQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      const item = prev.find((c) => c.itemId === itemId);
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return prev.filter((c) => c.itemId !== itemId);
      const maxQ = item.maxQuantity;
      const finalQty = maxQ !== undefined && newQty > maxQ ? maxQ : newQty;
      return prev.map((c) =>
        c.itemId === itemId ? { ...c, quantity: finalQty } : c,
      );
    });
  };

  const removeItem = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  };

  // Build WhatsApp message for a store
  const getWhatsAppUrl = (
    store: Store,
    items: SearchCartItem[],
    storeKey: string,
  ) => {
    const phone = store.phoneNumber;
    if (!phone?.phoneNumber) return null;

    const fullNumber = `${phone.countryCode.replace("+", "")}${phone.phoneNumber}`;
    const lines = items.map(
      (item) =>
        `• ${item.name} (Qty: ${item.quantity}) - ${item.currency || "₹"}${(item.salePrice || item.price || 0).toLocaleString()}`,
    );

    const apptDate = appointmentDates[storeKey] || "";
    const apptTime = appointmentTimes[storeKey] || "";
    const deliveryMode = deliveryModes[storeKey] || "appointment";
    const deliverySubMode = deliverySubModes[storeKey] || "national";
    const deliveryAddress = deliveryAddresses[storeKey] || "";

    let appointmentInfo = "";
    if (deliveryMode === "delivery") {
      const typeLabel = deliverySubMode === "national" ? "National" : "International";
      appointmentInfo = `\n\n*Delivery Details:*\n🏠 Mode: Home Delivery\n🚚 Type: ${typeLabel}\n📍 Address: ${deliveryAddress || "Not specified"}`;
    } else if (apptDate && apptTime) {
      appointmentInfo = `\n\n*Appointment Details:*\n📅 Date: ${apptDate}\n🕒 Time: ${apptTime}`;
    }

    const text = encodeURIComponent(
      `Hi! I'm interested in the following items:\n${lines.join("\n")}${appointmentInfo}\n\nPlease let me know about availability and delivery. Thank you!`,
    );
    return `https://wa.me/${fullNumber}?text=${text}`;
  };

  // Submit appointment to server + open WhatsApp
  const handleWhatsAppOrder = async (
    store: Store,
    items: SearchCartItem[],
    storeKey: string,
  ) => {
    const apptDate = appointmentDates[storeKey] || "";
    const apptTime = appointmentTimes[storeKey] || "";

    if (!apptDate || !apptTime) {
      alert("Please select a date and time for your appointment.");
      return;
    }

    setSubmittingStore(storeKey);
    try {
      const totalAmount = items.reduce(
        (sum, i) => sum + (i.salePrice || i.price || 0) * i.quantity,
        0,
      );
      await createAppointment({
        companySlug: store.companySlug || storeKey,
        items: items.map((i) => ({
          itemId: i.itemId,
          name: i.name,
          quantity: i.quantity,
          price: i.salePrice || i.price || 0,
          currency: i.currency || "₹",
        })),
        appointmentDate: apptDate,
        appointmentTime: apptTime,
        totalAmount,
      });
    } catch (err) {
      console.error("Failed to save appointment:", err);
    } finally {
      setSubmittingStore(null);
    }

    // Open WhatsApp
    const waUrl = getWhatsAppUrl(store, items, storeKey);
    if (waUrl) {
      window.open(waUrl, "_blank");
    }
  };

  // Group by store
  const storeGroups = cart.reduce<
    Record<string, { store: Store; items: SearchCartItem[] }>
  >((acc, item) => {
    if (!item.store) return acc;
    const key = item.store.companySlug || item.store.companyName;
    if (!acc[key]) {
      acc[key] = { store: item.store, items: [] };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-page">
      {/* Header */}
      <header className="cart-header">
        <Link href="/search" className="back-btn">
          <FiArrowLeft />
        </Link>
        <h1>
          <FiShoppingCart /> Cart
        </h1>
      </header>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <FiShoppingCart />
          <h2>Your cart is empty</h2>
          <p>Add products or services from the search page</p>
          <Link href="/search" className="back-to-search-btn">
            ← Back to Search
          </Link>
        </div>
      ) : (
        <main className="cart-content">
          {Object.entries(storeGroups).map(([key, { store, items }]) => (
            <section key={key} className="cart-store-section">
              {/* Item count badge */}
              <div className="cart-store-badge-row">
                <span className="cart-store-item-count">
                  {items.reduce((s, i) => s + i.quantity, 0)}{" "}
                  {items.reduce((s, i) => s + i.quantity, 0) === 1
                    ? "item"
                    : "items"}
                </span>
                <button
                  className="cart-store-clear-btn"
                  onClick={() => {
                    items.forEach((item) => removeItem(item.itemId));
                  }}
                >
                  <FiTrash2 /> Remove
                </button>
              </div>
              {/* Store header */}
              <div className="cart-store-header">
                <div className="cart-store-info">
                  <div className="cart-store-avatar">
                    {(() => {
                      const imgUrl = sanitizeImageUrl(store.profileImage);
                      return imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={store.companyName}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <span>{store.companyName.charAt(0)}</span>
                      );
                    })()}
                  </div>
                  <div className="cart-store-details">
                    <h2 className="cart-store-name">{store.companyName}</h2>
                    {store.phoneNumber?.phoneNumber && (
                      <span className="cart-store-phone">
                        📞 {store.phoneNumber.countryCode}{" "}
                        {store.phoneNumber.phoneNumber}
                      </span>
                    )}
                    {store.storeAddress && (
                      <a
                        href={`https://www.google.com/maps?q=${store.storeLocation?.latitude || 0},${store.storeLocation?.longitude || 0}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cart-store-address"
                      >
                        <FiMapPin /> {store.storeAddress.split("\n")[0]}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="cart-items">
                {items.map((item) => {
                  const availableQty =
                    item.itemType !== "service" &&
                    item.maxQuantity !== undefined
                      ? getAvailableQuantity(item.itemId, item.maxQuantity)
                      : undefined;
                  return (
                    <div key={item.itemId} className="cart-item">
                      <div className="cart-item-image">
                        {(() => {
                          const imgUrl = sanitizeImageUrl(item.image);
                          return imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={item.name}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <div className="cart-item-placeholder">
                              {item.itemType === "service" ? "🛠️" : "📦"}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="cart-item-details">
                        <h3 className="cart-item-name">{item.name}</h3>
                        <p className="cart-item-price">
                          {item.currency || "₹"}
                          {(item.salePrice || item.price || 0).toLocaleString()}
                        </p>
                        <span className="cart-item-type">
                          {item.itemType === "service"
                            ? "🛠️ Service"
                            : "📦 Product"}
                        </span>
                        {item.taxEntries && item.taxEntries.length > 0 && (
                          <div className="cart-item-tax">
                            {item.taxEntries.map((e, i) => (
                              <span key={i} className="tax-tag">
                                {e.type.toUpperCase()} ({e.percentage}%)
                              </span>
                            ))}
                          </div>
                        )}
                        {availableQty !== undefined &&
                          item.quantity >= availableQty && (
                            <div
                              className="cart-item-stock-warning"
                              style={{
                                color: "#ef4444",
                                fontSize: "0.75rem",
                                marginTop: "4px",
                                fontWeight: "bold",
                              }}
                            >
                              Available stock ({availableQty})
                            </div>
                          )}
                      </div>
                      <div className="cart-item-actions">
                        <div className="qty-controls">
                          <button onClick={() => updateQty(item.itemId, -1)}>
                            <FiMinus />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            disabled={
                              availableQty !== undefined &&
                              item.quantity >= availableQty
                            }
                            style={{
                              opacity:
                                availableQty !== undefined &&
                                item.quantity >= availableQty
                                  ? 0.3
                                  : 1,
                            }}
                            onClick={() => {
                              if (
                                availableQty !== undefined &&
                                item.quantity >= availableQty
                              )
                                return;
                              updateQty(item.itemId, 1);
                            }}
                          >
                            <FiPlus />
                          </button>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.itemId)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Selection */}
              <div className="appointment-section">
                <div className="appointment-title">
                  <FiClock />
                  <h3>Fulfillment Type</h3>
                </div>
                <div className="delivery-type-toggle">
                  <button
                    className={`type-chip ${
                      (deliveryModes[key] || "appointment") === "appointment"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setDeliveryModes((prev) => ({
                        ...prev,
                        [key]: "appointment",
                      }))
                    }
                  >
                    🏪 Stay In-Store (Appointment)
                  </button>
                  {items.some((i) => i.delivery?.available) && (
                    <button
                      className={`type-chip ${
                        deliveryModes[key] === "delivery" ? "active" : ""
                      }`}
                      onClick={() =>
                        setDeliveryModes((prev) => ({
                          ...prev,
                          [key]: "delivery",
                        }))
                      }
                    >
                      🏠 Home Delivery
                    </button>
                  )}
                </div>

                {(deliveryModes[key] || "appointment") === "appointment" ? (
                  <div className="appointment-inputs">
                    <div className="appointment-field">
                      <label>Pick a Date</label>
                      <input
                        type="date"
                        value={appointmentDates[key] || ""}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setAppointmentDates((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="appointment-field">
                      <label>Pick a Time</label>
                      <input
                        type="time"
                        value={appointmentTimes[key] || ""}
                        onChange={(e) =>
                          setAppointmentTimes((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="delivery-address-section">
                    {/* National vs International Toggles */}
                    {(() => {
                      const hasNational = items.some(
                        (i) => i.delivery?.national?.enabled,
                      );
                      const hasInternational = items.some(
                        (i) => i.delivery?.international?.enabled,
                      );

                      if (hasNational && hasInternational) {
                        return (
                          <div className="delivery-submode-toggle">
                            <button
                              className={`sub-chip ${
                                (deliverySubModes[key] || "national") ===
                                "national"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                setDeliverySubModes((prev) => ({
                                  ...prev,
                                  [key]: "national",
                                }))
                              }
                            >
                              🇮🇳 National
                            </button>
                            <button
                              className={`sub-chip ${
                                deliverySubModes[key] === "international"
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                setDeliverySubModes((prev) => ({
                                  ...prev,
                                  [key]: "international",
                                }))
                              }
                            >
                              🌍 International
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Map Visualization */}
                    {(() => {
                      const mode = deliverySubModes[key] || "national";
                      const storeLoc = store.storeLocation;
                      const nationalData = items.find(
                        (i) => i.delivery?.national?.enabled,
                      )?.delivery?.national;
                      const internationalData = items.find(
                        (i) => i.delivery?.international?.enabled,
                      )?.delivery?.international;

                      if (mode === "national" && storeLoc && nationalData) {
                        return (
                          <div className="delivery-map-wrapper">
                            <div className="map-label">
                              📍 Delivery Radius:{" "}
                              {nationalData.radiusKm || "All"} km
                            </div>
                            <DeliveryMap
                              lat={storeLoc.latitude || 0}
                              lng={storeLoc.longitude || 0}
                              radiusKm={nationalData.radiusKm}
                              mode="national"
                            />
                            {nationalData.conditions && (
                              <p className="delivery-conditions">
                                📝 {nationalData.conditions}
                              </p>
                            )}
                          </div>
                        );
                      } else if (mode === "international" && internationalData) {
                        return (
                          <div className="delivery-international-list">
                            <div className="map-label">
                              🌍 Available Countries:
                            </div>
                            <div className="countries-grid">
                              {internationalData.countries?.map((c, idx) => (
                                <div key={idx} className="country-chip">
                                  <span className="name">{c.name}</span>
                                  <span className="rate">{c.rate}</span>
                                </div>
                              ))}
                            </div>
                            {internationalData.conditions && (
                              <p className="delivery-conditions">
                                📝 {internationalData.conditions}
                              </p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="appointment-field">
                      <label>Delivery Address</label>
                      <textarea
                        placeholder="Enter your full address for delivery..."
                        value={deliveryAddresses[key] || ""}
                        onChange={(e) =>
                          setDeliveryAddresses((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tax breakdown + Store total */}
              <div className="cart-store-footer">
                {(() => {
                  const subtotal = items.reduce(
                    (s, i) => s + (i.salePrice || i.price || 0) * i.quantity,
                    0,
                  );
                  const cur = items[0]?.currency || "₹";
                  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

                  const taxMap: Record<string, number> = {};
                  items.forEach((item) => {
                    if (item.taxEntries) {
                      item.taxEntries.forEach((entry) => {
                        const taxAmount =
                          (((item.salePrice || item.price || 0) *
                            entry.percentage) /
                            100) *
                          item.quantity;
                        taxMap[entry.type] =
                          (taxMap[entry.type] || 0) + taxAmount;
                      });
                    }
                  });
                  const totalTax = Object.values(taxMap).reduce(
                    (s, v) => s + v,
                    0,
                  );
                  const grandTotal = subtotal + totalTax;

                  return (
                    <>
                      <div className="cart-store-total">
                        <span>Subtotal ({itemCount} items)</span>
                        <span className="subtotal-price">
                          {cur}
                          {subtotal.toLocaleString()}
                        </span>
                      </div>
                      {Object.keys(taxMap).length > 0 && (
                        <>
                          {Object.entries(taxMap).map(([type, amount]) => (
                            <div key={type} className="cart-tax-row">
                              <span>{type}</span>
                              <span>
                                +{cur}
                                {Math.round(amount).toLocaleString()}
                              </span>
                            </div>
                          ))}
                          <div className="cart-grand-total">
                            <span>Total (incl. tax)</span>
                            <span className="total-price">
                              {cur}
                              {Math.round(grandTotal).toLocaleString()}
                            </span>
                          </div>
                        </>
                      )}
                      {Object.keys(taxMap).length === 0 && (
                        <div className="cart-grand-total">
                          <span>Total</span>
                          <span className="total-price">
                            {cur}
                            {subtotal.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
                {store.phoneNumber?.phoneNumber ? (
                  <button
                    className="whatsapp-btn"
                    disabled={submittingStore === key}
                    onClick={() => handleWhatsAppOrder(store, items, key)}
                  >
                    <FaWhatsapp />
                    {submittingStore === key
                      ? "Submitting..."
                      : "Order via WhatsApp"}
                  </button>
                ) : (
                  <p className="no-phone-notice">
                    Phone number not available for this store
                  </p>
                )}
              </div>
            </section>
          ))}
        </main>
      )}
    </div>
  );
}
