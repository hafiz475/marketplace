"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { getPublicProfile, createAppointment, createChatOpsMessage } from "@/lib/api";
import { useCart } from "@/lib/CartContext";
import { GlobeLoader } from "@/components/GlobeLoader";
import { ChatOpsGlobe } from "@/components/ChatOpsGlobe";
import PublicLoadingScreen from "@/components/PublicLoadingScreen";
import BusinessAtmosphere from "@/components/BusinessAtmosphere";
import PhoneInput from "@/components/PhoneInput";
import ChatOpsSuccessOverlay from "@/components/ChatOpsSuccessOverlay";
import dynamic from "next/dynamic";
import { COUNTRY_CODES } from "@/assets/AppConst";

const LocationPicker = dynamic(
  () => import("@/components/LocationPicker/LocationPicker"),
  { ssr: false }
);
import {
  SCREW_ICON,
  CALENDAR_ICON,
  CART_ICON,
  PLACEHOLDER_ICON,
  SOCIAL_ICONS,
} from "@/lib/publicIcons";
import "@/styles/PublicCart.scss";

// Vector SVG Icons for premium theme consistency
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M19.077 4.928A9.852 9.852 0 0 0 12.04 2c-5.433 0-9.85 4.417-9.85 9.85 0 1.737.452 3.44 1.31 4.928L2.05 22l5.35-1.403a9.816 9.816 0 0 0 4.636 1.154h.004c5.43 0 9.85-4.417 9.85-9.85a9.805 9.805 0 0 0-2.813-6.973zM12.04 20.01h-.003a8.188 8.188 0 0 1-4.18-1.155l-.3-.178-3.113.817.83-3.037-.195-.31a8.18 8.18 0 0 1-1.255-4.3c0-4.515 3.677-8.19 8.195-8.19a8.163 8.163 0 0 1 5.79 2.404 8.163 8.163 0 0 1 2.402 5.795c0 4.518-3.677 8.196-8.19 8.196zm4.515-6.172c-.247-.123-1.463-.722-1.69-.804-.226-.083-.39-.123-.555.123-.165.247-.64.804-.783.968-.145.165-.29.185-.537.062a7.484 7.484 0 0 1-2.316-1.427 8.243 8.243 0 0 1-1.603-1.996c-.145-.247-.015-.38.11-.502.11-.11.247-.29.37-.433.124-.144.165-.247.247-.412.083-.165.042-.31-.02-.433-.063-.124-.556-1.34-.764-1.836-.2-.486-.403-.42-.555-.427h-.475c-.165 0-.433.062-.66.31-.227.247-.866.845-.866 2.062 0 1.216.887 2.392.989 2.536.103.144 1.745 2.666 4.23 3.738.59.255 1.05.408 1.41.52.593.188 1.13.16 1.558.097.477-.072 1.464-.598 1.67-.175.207-.423.207-.783.144-.845-.062-.062-.247-.144-.495-.268z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.15L7.74 13.3L3.64 12c-.89-.26-.89-.89.19-1.31l16.03-6.19c.74-.26 1.39.19 1.15 1.23l-2.72 12.82c-.19.97-.78 1.2-1.59.74l-4.14-3.05l-2 1.93c-.22.22-.41.41-.83.41z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ display: 'block', margin: 'auto' }}>
    <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h2V1H13C9.7 1 9 2.8 9 5v3z"/>
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TiktokIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.58-4.09-1.47-.15-.1-.3-.22-.45-.35v6.51c0 2.25-.6 4.56-2.18 6.16-1.55 1.62-3.89 2.23-6.07 1.9-2.28-.31-4.44-1.89-5.18-4.1-1.02-2.95.26-6.51 3.12-7.79 1.18-.54 2.5-.66 3.77-.42v4.11c-.93-.27-1.97-.13-2.73.47-.84.66-1.13 1.84-.87 2.86.3 1.17 1.48 1.95 2.68 1.83 1.25-.09 2.29-1.22 2.29-2.52V.02z"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 488 512" width="18" height="18" fill="currentColor" style={{ display: 'block', margin: 'auto' }}>
    <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
  </svg>
);

const ReviewIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

const PreviewIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', position: 'relative', top: '-1px' }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const hasSocialValue = (val: any) => {
  if (!val) return false;
  if (typeof val === "object") {
    return !!val.phoneNumber?.trim();
  }
  return !!val.trim();
};

interface Profile {
  industry?: string;
  businessIcon?: string;
  selectedTheme?: string;
  phoneNumber?: { countryCode?: string; phoneNumber?: string } | string;
  company?: string;
  profileImage?: string;
  instagramProfile?: string;
  whatsappProfile?: string;
  telegramProfile?: string;
  mailId?: string;
  facebookProfile?: string;
  youtubeProfile?: string;
  tiktokProfile?: string;
  threadsProfile?: string;
  xProfile?: string;
  linkedInProfile?: string;
  googleBusiness?: string;
  commentLink?: string;
}

// Channels list configuration for dynamic toggle and input rendering
const CHANNELS = [
  { key: "phone", label: "Phone Number", icon: <PhoneIcon />, placeholder: "Phone Number (e.g. +91 9876543210)", alwaysShow: true, type: "phone" },
  { key: "email", profileField: "mailId", label: "Email Address", icon: <EmailIcon />, placeholder: "Email Address (e.g. name@example.com)", type: "email" },
  { key: "whatsapp", profileField: "whatsappProfile", label: "WhatsApp Number", icon: <WhatsAppIcon />, placeholder: "WhatsApp Number (e.g. +91 9876543210)", type: "phone" },
  { key: "telegram", profileField: "telegramProfile", label: "Telegram Username", icon: <TelegramIcon />, placeholder: "Telegram Handle or URL (e.g. @username or t.me/username)", type: "text" },
  { key: "instagram", profileField: "instagramProfile", label: "Instagram Handle", icon: <InstagramIcon />, placeholder: "Instagram Handle or URL (e.g. @username or instagram.com/username)", type: "text" },
  { key: "facebook", profileField: "facebookProfile", label: "Facebook Profile", icon: SOCIAL_ICONS.facebook, placeholder: "Facebook Profile Name or URL (e.g. username or facebook.com/username)", type: "text" },
  { key: "youtube", profileField: "youtubeProfile", label: "YouTube Profile", icon: SOCIAL_ICONS.youtube, placeholder: "YouTube Channel or URL (e.g. @channel or youtube.com/@channel)", type: "text" },
  { key: "x", profileField: "xProfile", label: "X / Twitter Handle", icon: SOCIAL_ICONS.x, placeholder: "X Handle or URL (e.g. @handle or x.com/handle)", type: "text" },
  { key: "linkedin", profileField: "linkedInProfile", label: "LinkedIn Profile", icon: SOCIAL_ICONS.linkedin, placeholder: "LinkedIn Profile Name or URL (e.g. username or linkedin.com/in/username)", type: "text" },
  { key: "tiktok", profileField: "tiktokProfile", label: "TikTok Profile", icon: SOCIAL_ICONS.tiktok, placeholder: "TikTok Handle or URL (e.g. @handle or tiktok.com/@handle)", type: "text" },
  { key: "threads", profileField: "threadsProfile", label: "Threads Profile", icon: SOCIAL_ICONS.threads, placeholder: "Threads Handle or URL (e.g. username or threads.net/@username)", type: "text" },
  { key: "google", profileField: "googleBusiness", label: "Google Business", icon: SOCIAL_ICONS.google, placeholder: "Google Profile Link or Business Name", type: "text" },
  { key: "review", profileField: "commentLink", label: "Review Link", icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ display: 'block' }}>
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ), placeholder: "Review Link / Comment / Name", type: "text" }
];

// Gear Cursor Component (duplicated for standalone usage)
const GearCursor = ({ themeClass = "" }: { themeClass?: string }) => {
  const mainCursor = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const moveCursor = (e: MouseEvent) => {
      if (mainCursor.current) {
        mainCursor.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
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
        zIndex: 9999999,
        pointerEvents: "none",
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

export default function CartPage() {
  const params = useParams();
  const company = params.company as string;
  const {
    items: cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState("");
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [bookingTime, setBookingTime] = useState("");
  const [bookingTimeFrom, setBookingTimeFrom] = useState("");
  const [bookingTimeTo, setBookingTimeTo] = useState("");

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string>("chatops");
  const [customerName, setCustomerName] = useState<string>("");
  const [activeSocials, setActiveSocials] = useState<{ [key: string]: boolean }>({ phone: true });
  const [contacts, setContacts] = useState<{ [key: string]: string }>({
    phone: "",
    email: "",
    instagram: "",
    telegram: "",
    whatsapp: "",
    facebook: "",
    youtube: "",
    x: "",
    linkedin: "",
    tiktok: "",
    threads: "",
    google: "",
    review: ""
  });
  const [submittingMessage, setSubmittingMessage] = useState(false);

  const [customerAddress, setCustomerAddress] = useState("");
  const [customerCoordinates, setCustomerCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [requestDelivery, setRequestDelivery] = useState(false);

  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c;
    return Math.round(d * 10) / 10;
  };

  const resolveDeliveryRate = (distance: number, cartItemsList: any[]) => {
    let minRate = Infinity;
    
    for (const item of cartItemsList) {
      const nationalConfigs = item.delivery?.configs?.national || [];
      for (const config of nationalConfigs) {
        for (const rate of (config.vehicleRates || [])) {
          if (Array.isArray(rate.distanceRates) && rate.distanceRates.length > 0) {
            const sortedSlabs = [...rate.distanceRates].sort((a, b) => a.upToKm - b.upToKm);
            for (const slab of sortedSlabs) {
              if (distance <= slab.upToKm) {
                const cost = distance * slab.chargePerKm;
                if (cost < minRate) minRate = cost;
                break;
              }
            }
          }
        }
      }
    }
    
    if (minRate !== Infinity) {
      return Math.round(minRate);
    }
    
    return Math.round(distance * 12);
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCustomerCoordinates({ latitude: lat, longitude: lng });
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            if (data.display_name) {
              setCustomerAddress(data.display_name);
            }
          } catch (err) {
            console.error("Failed to reverse geocode detected location:", err);
          }
        },
        (error) => {
          console.error("Error getting location: ", error);
          alert("Could not retrieve geolocation automatically. Please click on the map to select your location.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const storeLat = (profile as any)?.storeLocation?.latitude;
  const storeLng = (profile as any)?.storeLocation?.longitude;
  
  const deliveryDistance = (customerCoordinates && storeLat && storeLng)
    ? getDistanceInKm(customerCoordinates.latitude, customerCoordinates.longitude, storeLat, storeLng)
    : null;
    
  const deliveryRate = (deliveryDistance !== null)
    ? resolveDeliveryRate(deliveryDistance, cartItems)
    : null;

  const isHomeDeliverable = cartItems.length > 0 && cartItems.every(item => item.delivery?.available);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const startTime = Date.now();
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
          setProfile(mapped as any);
        }
        const elapsed = Date.now() - startTime;
        if (elapsed < 2000)
          await new Promise((r) => setTimeout(r, 2000 - elapsed));
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [company]);

  // Dynamically update document title and favicon based on profile
  useEffect(() => {
    const storeName = profile?.company || (company ? company.charAt(0).toUpperCase() + company.slice(1) : "Store");
    document.title = `Cart | ${storeName}`;

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

  // Group cart items by currency and calculate totals per currency
  const calculateTotalsByCurrency = () => {
    const totals: Record<string, number> = {};
    cartItems.forEach((item) => {
      const currency = item.currency || "₹";
      if (!totals[currency]) totals[currency] = 0;
      totals[currency] += item.price * item.quantity;
    });
    return totals;
  };

  const totalsByCurrency = calculateTotalsByCurrency();

  const buildEnquiryMessage = () => {
    let message = `*Order/Booking Request*\n`;
    message += `--------------------------\n`;

    cartItems.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Qty: ${item.quantity} | Price: ${item.currency || "₹"}${item.price}\n`;
      if (item.taxPercentage && item.taxPercentage > 0) {
        message += `   (Incl. ${item.taxPercentage}% Tax)\n`;
      }
      message += `   Total: ${item.currency || "₹"}${itemTotal}\n`;
      message += `--------------------------\n`;
    });

    let grandTotalText = Object.entries(totalsByCurrency)
      .map(([currency, total]) => `${currency}${total}`)
      .join(" + ");
    message += `*Grand Total: ${grandTotalText}*\n\n`;
    
    if (bookingDate) {
      message += `*Appointment Details:*\n`;
      message += `📅 Date: ${bookingDate}\n`;
      if (requestDelivery && isHomeDeliverable) {
        if (bookingTimeFrom || bookingTimeTo) {
          message += `🕒 Delivery Window: ${bookingTimeFrom || '?'} – ${bookingTimeTo || '?'}\n\n`;
        } else {
          message += `⚡ Express: Will try to deliver within ~1 hour\n\n`;
        }
      } else {
        if (bookingTime) {
          message += `🕒 Visit Time: ${bookingTime}\n\n`;
        }
      }
    }
    
    if (customerAddress) {
      message += `📍 *Delivery Details:*\n`;
      message += `🏠 Address: ${customerAddress}\n`;
      if (deliveryDistance !== null) {
        message += `📏 Distance: ${deliveryDistance} km\n`;
        if (requestDelivery && isHomeDeliverable) {
          message += `🚚 Requested Delivery: Yes (Rate: ₹${deliveryRate})\n`;
        } else {
          message += `🚚 Requested Delivery: No\n`;
        }
      }
      if (customerCoordinates) {
        message += `🗺️ Coordinates: ${customerCoordinates.latitude.toFixed(6)}, ${customerCoordinates.longitude.toFixed(6)}\n`;
      }
      message += `\n`;
    }
    message += `Please confirm my booking. Thank you!`;
    return message;
  };

  const handleChannelClick = async (channelKey: string) => {
    setActiveChannel(channelKey);
    setShowConnectModal(true);

    if (cartItems.length > 0 && company) {
      createChatOpsMessage({
        companySlug: company,
        customerContacts: {},
        items: cartItems.map(item => ({
          itemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          sku: item.sku || "",
          itemType: item.type || "product"
        })),
        messageTemplate: `User clicked ${channelKey} button on Cart Page`,
        communicationChannel: channelKey,
        source: "website",
        isClick: true
      }).catch(err => console.error("Failed to log cart click:", err));
    }
  };

  if (loading)
    return (
      <PublicLoadingScreen
        industry={profile?.industry}
        selectedTheme={profile?.selectedTheme}
      />
    );

  // Determine theme class from profile
  const themeClass =
    profile?.selectedTheme && profile.selectedTheme !== "default"
      ? `theme-${profile.selectedTheme.toLowerCase().replace(/\s+/g, "-")}`
      : "";

  if (cartItems.length === 0) {
    return (
      <div className={`public-cart-page automotive-theme empty ${themeClass}`}>
        <div className="empty-state">
          <div className="empty-icon">{CART_ICON}</div>
          <h2>Your cart is empty</h2>
          <p>Add some products or services to get started.</p>
          <Link href={`/sites/${company}`} className="back-btn">
            RETURN TO SHOP
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`public-cart-page automotive-theme ${themeClass}`}>
      <BusinessAtmosphere industry={profile?.industry} icon={profile?.businessIcon} />
      <GearCursor themeClass={themeClass} />
      <div className="auto-background-grid"></div>
      <div className="auto-glow-shapes">
        <div className="glow-shape glow-1"></div>
        <div className="glow-shape glow-2"></div>
      </div>

      <header className="cart-header">
        <Link href={`/sites/${company}`} className="back-link">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
          Back to Shop
        </Link>
        <h1>Secure Checkout</h1>
      </header>

      <main className="cart-content">
        <section className="cart-list">
          <div className="section-title">
            <span className="screw">{SCREW_ICON}</span>
            <h2>Review Items</h2>
          </div>
          {cartItems.map((item) => (
            <div key={item.itemId} className="cart-item">
              <button
                className="remove-item"
                onClick={() => removeFromCart(item.itemId)}
                title="Remove item"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="item-img">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="img-placeholder">{PLACEHOLDER_ICON}</div>
                )}
              </div>
              <div className="item-details">
                <div className="item-top">
                  <span className="item-category">{item.category}</span>
                  {item.sku && (
                    <span className="item-sku">SKU: {item.sku}</span>
                  )}
                </div>
                <h3>{item.name}</h3>
                {item.description && (
                  <p className="item-desc">
                    {item.description.length > 120
                      ? `${item.description.substring(0, 120)}...`
                      : item.description}
                  </p>
                )}
                <div className="price-row">
                  <span className="unit-price">
                    {item.currency || "₹"}
                    {item.price}
                  </span>
                  {item.taxPercentage && item.taxPercentage > 0 && (
                    <span className="tax-tag">
                      Incl. {item.taxPercentage}% Tax
                    </span>
                  )}
                </div>
              </div>
              <div className="item-actions">
                <div className="quantity-ctrl">
                  <button
                    onClick={() =>
                      updateQuantity(item.itemId, item.quantity - 1)
                    }
                  >
                    -
                  </button>
                  <span className="q-val">{item.quantity}</span>
                  <button
                    disabled={
                      item.type !== "service" &&
                      item.maxQuantity !== undefined &&
                      item.quantity >= item.maxQuantity
                    }
                    style={{
                      opacity:
                        item.type !== "service" &&
                        item.maxQuantity !== undefined &&
                        item.quantity >= item.maxQuantity
                          ? 0.3
                          : 1,
                    }}
                    onClick={() => {
                      if (
                        item.type !== "service" &&
                        item.maxQuantity !== undefined &&
                        item.quantity >= item.maxQuantity
                      )
                        return;
                      updateQuantity(item.itemId, item.quantity + 1);
                    }}
                  >
                    +
                  </button>
                </div>
                {item.type !== "service" &&
                  item.maxQuantity !== undefined &&
                  item.quantity >= item.maxQuantity && (
                    <div
                      className="stock-warning"
                      style={{
                        color: "#ef4444",
                        fontSize: "0.75rem",
                        marginTop: "4px",
                        fontWeight: "bold",
                        textAlign: "right",
                      }}
                    >
                      Max stock reached ({item.maxQuantity})
                    </div>
                  )}
                <span
                  className="item-total"
                  style={{
                    marginTop:
                      item.type !== "service" &&
                      item.maxQuantity !== undefined &&
                      item.quantity >= item.maxQuantity
                        ? "4px"
                        : "auto",
                  }}
                >
                  {item.currency || "₹"}
                  {item.price * item.quantity}
                </span>
              </div>
            </div>
          ))}
        </section>

        <aside className="checkout-sidebar">
          <div className="booking-section">
            <div className="section-title">
              <span className="screw">{CALENDAR_ICON}</span>
              <h2>Schedule Appointment</h2>
            </div>
            <div className="input-group">
              <label>Pick a Date</label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            {requestDelivery && isHomeDeliverable ? (
              <div className="input-group">
                <label style={{ opacity: !bookingDate ? 0.5 : 1 }}>Preferred Delivery Window</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="time"
                    value={bookingTimeFrom}
                    disabled={!bookingDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBookingTimeFrom(val);
                      if (bookingTimeTo && bookingTimeTo < val) {
                        setBookingTimeTo(val);
                      }
                    }}
                    style={{ 
                      flex: 1,
                      opacity: !bookingDate ? 0.4 : 1,
                      cursor: !bookingDate ? 'not-allowed' : 'text'
                    }}
                  />
                  <span style={{ color: '#888', fontSize: '0.85rem', fontWeight: 'bold', opacity: !bookingDate ? 0.4 : 1 }}>to</span>
                  <input
                    type="time"
                    value={bookingTimeTo}
                    min={bookingTimeFrom}
                    disabled={!bookingDate || !bookingTimeFrom}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (bookingTimeFrom && val < bookingTimeFrom) {
                        setBookingTimeTo(bookingTimeFrom);
                      } else {
                        setBookingTimeTo(val);
                      }
                    }}
                    style={{ 
                      flex: 1,
                      opacity: (!bookingDate || !bookingTimeFrom) ? 0.4 : 1,
                      cursor: (!bookingDate || !bookingTimeFrom) ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
                {!(bookingTimeFrom || bookingTimeTo) && bookingDate && (
                  <p style={{ color: '#ff8c00', fontSize: '0.8rem', marginTop: '8px', fontStyle: 'italic' }}>⚡ No time set — we&apos;ll aim to deliver within ~1 hour</p>
                )}
              </div>
            ) : (
              <div className="input-group">
                <label style={{ opacity: !bookingDate ? 0.5 : 1 }}>Pick a Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  disabled={!bookingDate}
                  onChange={(e) => setBookingTime(e.target.value)}
                  style={{
                    opacity: !bookingDate ? 0.4 : 1,
                    cursor: !bookingDate ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            )}
          </div>

          {/* Geolocation & Delivery Details - SEPARATE CARD ABOVE TOTAL CARD */}
          <div className="customer-delivery-container">
            <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="screw">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </span>
                <h2>Customer Delivery</h2>
              </div>
              <button
                type="button"
                className="detect-loc-btn"
                onClick={handleDetectLocation}
              >
                📡 Detect My Location
              </button>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <LocationPicker 
                location={customerCoordinates} 
                storeLocation={storeLat && storeLng ? { latitude: storeLat, longitude: storeLng } : null}
                companyName={profile?.company || (company as string)}
                profileImage={profile?.profileImage}
                onChange={(data) => {
                  setCustomerCoordinates({ latitude: data.latitude, longitude: data.longitude });
                  setCustomerAddress(data.address);
                }}
              />
            </div>

            {customerAddress && (
              <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '16px', borderRadius: '16px' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--art-font-bold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--art-text-muted)', marginBottom: '8px' }}>Delivery Address</label>
                  <textarea 
                    value={customerAddress} 
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    rows={3}
                    style={{ 
                      width: '100%', 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.15)', 
                      borderRadius: '8px', 
                      color: '#fff', 
                      padding: '10px', 
                      fontSize: '0.95rem', 
                      lineHeight: '1.4', 
                      fontFamily: 'var(--art-font-main)',
                      resize: 'vertical',
                      outline: 'none'
                    }}
                    placeholder="Enter/Edit your delivery address..."
                  />
                </div>
                {deliveryDistance !== null && (
                  <div style={{ background: 'rgba(var(--art-primary-rgb, 255, 140, 0), 0.05)', border: '1px dashed rgba(var(--art-primary-rgb, 255, 140, 0), 0.3)', padding: '16px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--art-font-main)', color: '#fff', fontSize: '0.95rem' }}>Distance to Store: <strong style={{ color: 'var(--art-primary)' }}>{deliveryDistance} km</strong></span>
                      {customerCoordinates && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--art-text-muted)', fontFamily: 'var(--art-font-main)' }}>
                          ({customerCoordinates.latitude.toFixed(4)}, {customerCoordinates.longitude.toFixed(4)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="delivery-status-badge-row" style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'block', fontFamily: 'var(--art-font-bold)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--art-text-muted)', marginBottom: '4px' }}>Delivery Status</label>
              <div>
                {isHomeDeliverable ? (
                  <span className="badge available" style={{ backgroundColor: 'rgba(var(--art-success-rgb), 0.15)', color: 'var(--art-success)', border: '1px solid var(--art-success)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' }}>
                    ✓ Home Deliverable
                  </span>
                ) : (
                  <span className="badge unavailable" style={{ backgroundColor: 'rgba(var(--art-danger-rgb), 0.15)', color: 'var(--art-danger)', border: '1px solid var(--art-danger)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' }}>
                    ✗ Delivery Not Available
                  </span>
                )}
              </div>
            </div>

            {isHomeDeliverable && (
              <>
                <div className="delivery-toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                  <span style={{ color: '#fff', fontSize: '0.95rem', fontFamily: 'var(--art-font-bold)' }}>Request Delivery?</span>
                  <button
                    type="button"
                    className={requestDelivery ? "active" : ""}
                    onClick={() => setRequestDelivery(prev => !prev)}
                    style={{
                      padding: '8px 20px',
                      backgroundColor: requestDelivery ? 'var(--art-primary)' : '#333',
                      border: 'none',
                      borderRadius: '20px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      transition: '0.3s'
                    }}
                  >
                    {requestDelivery ? 'ON' : 'OFF'}
                  </button>
                </div>

                {requestDelivery && (
                  <div className="delivery-calculation-box" style={{ background: 'rgba(var(--art-primary-rgb, 255, 140, 0), 0.05)', border: '1px dashed var(--art-primary)', padding: '16px', borderRadius: '16px', color: '#ccc', fontSize: '0.95rem', fontFamily: 'var(--art-font-main)' }}>
                    {deliveryDistance !== null ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>📏 Distance to Store: <strong style={{ color: 'var(--art-primary)' }}>{deliveryDistance} km</strong></div>
                        <div>💰 Calculated Delivery Rate: <strong style={{ color: 'var(--art-primary)' }}>₹{deliveryRate || 0}</strong></div>
                      </div>
                    ) : (
                      <div style={{ color: '#aaa', fontStyle: 'italic' }}>
                        Please detect coordinates or mark map to calculate distance & rates.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="summary-section">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              <div key={currency} className="summary-row">
                <span>Subtotal ({currency})</span>
                <span>
                  {currency}
                  {total}
                </span>
              </div>
            ))}
            <div className="summary-row">
              <span>Item</span>
              <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>
                {Object.entries(totalsByCurrency)
                  .map(([currency, total]) => `${currency}${total}`)
                  .join(" + ")}
              </span>
            </div>
            {(() => {
              const buttons: React.ReactNode[] = [];

              // WhatsApp Button (Always Shown)
              buttons.push(
                <button 
                  key="whatsapp"
                  className="whatsapp-icon-btn" 
                  onClick={() => handleChannelClick("whatsapp")}
                  disabled={!customerAddress}
                  title={customerAddress ? "Confirm via WhatsApp" : "Please select delivery address on map to checkout"}
                >
                  <WhatsAppIcon />
                </button>
              );

              // Phone/Call Button (Always Shown)
              buttons.push(
                <button 
                  key="phone"
                  className="phone-icon-btn" 
                  onClick={() => handleChannelClick("phone")}
                  disabled={!customerAddress}
                  title={customerAddress ? "Call Supplier" : "Please select delivery address on map to checkout"}
                >
                  <PhoneIcon />
                </button>
              );

              // Telegram Button (If Configured)
              if (profile?.telegramProfile) {
                buttons.push(
                  <button 
                    key="telegram"
                    className="telegram-icon-btn" 
                    onClick={() => handleChannelClick("telegram")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Contact via Telegram" : "Please select delivery address on map to checkout"}
                  >
                    <TelegramIcon />
                  </button>
                );
              }

              // Instagram Button (If Configured)
              if (profile?.instagramProfile) {
                buttons.push(
                  <button 
                    key="instagram"
                    className="instagram-icon-btn" 
                    onClick={() => handleChannelClick("instagram")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Contact via Instagram" : "Please select delivery address on map to checkout"}
                  >
                    <InstagramIcon />
                  </button>
                );
              }

              // Facebook Button (If Configured)
              if (profile?.facebookProfile) {
                buttons.push(
                  <button 
                    key="facebook"
                    className="facebook-icon-btn" 
                    onClick={() => handleChannelClick("facebook")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Visit Facebook Page" : "Please select delivery address on map to checkout"}
                  >
                    <FacebookIcon />
                  </button>
                );
              }

              // YouTube Button (If Configured)
              if (profile?.youtubeProfile) {
                buttons.push(
                  <button 
                    key="youtube"
                    className="youtube-icon-btn" 
                    onClick={() => handleChannelClick("youtube")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Visit YouTube Channel" : "Please select delivery address on map to checkout"}
                  >
                    <YoutubeIcon />
                  </button>
                );
              }

              // X Button (If Configured)
              if (profile?.xProfile) {
                buttons.push(
                  <button 
                    key="x"
                    className="x-icon-btn" 
                    onClick={() => handleChannelClick("x")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Visit X Profile" : "Please select delivery address on map to checkout"}
                  >
                    <XIcon />
                  </button>
                );
              }

              // TikTok Button (If Configured)
              if (profile?.tiktokProfile) {
                buttons.push(
                  <button 
                    key="tiktok"
                    className="tiktok-icon-btn" 
                    onClick={() => handleChannelClick("tiktok")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Visit TikTok Profile" : "Please select delivery address on map to checkout"}
                  >
                    <TiktokIcon />
                  </button>
                );
              }

              // LinkedIn Button (If Configured)
              if (profile?.linkedInProfile) {
                buttons.push(
                  <button 
                    key="linkedin"
                    className="linkedin-icon-btn" 
                    onClick={() => handleChannelClick("linkedin")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Visit LinkedIn Profile" : "Please select delivery address on map to checkout"}
                  >
                    <LinkedinIcon />
                  </button>
                );
              }

              // Google Business Button (If Configured)
              if (profile?.googleBusiness) {
                buttons.push(
                  <button 
                    key="google"
                    className="google-icon-btn" 
                    onClick={() => handleChannelClick("google")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Visit Google Business" : "Please select delivery address on map to checkout"}
                  >
                    <GoogleIcon />
                  </button>
                );
              }

              // Review Link Button (If Configured)
              if (profile?.commentLink) {
                buttons.push(
                  <button 
                    key="review"
                    className="review-icon-btn" 
                    onClick={() => handleChannelClick("review")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Write a Review" : "Please select delivery address on map to checkout"}
                  >
                    <ReviewIcon />
                  </button>
                );
              }

              // Email Button (If Configured)
              if (profile?.mailId) {
                buttons.push(
                  <button 
                    key="email"
                    className="email-icon-btn" 
                    onClick={() => handleChannelClick("email")}
                    disabled={!customerAddress}
                    title={customerAddress ? "Email Supplier" : "Please select delivery address on map to checkout"}
                  >
                    <EmailIcon />
                  </button>
                );
              }

              // ChatOps Connect Button
              const chatOpsBtn = (
                <button 
                  key="chatops"
                  className="circltrade-connect-btn cart-page-connect"
                  onClick={() => handleChannelClick("chatops")}
                  disabled={!customerAddress}
                  title={customerAddress ? "Connect ChatOps" : "Please select delivery address on map to checkout"}
                >
                  <ChatOpsGlobe size="100%" className="transparent-globe" />
                </button>
              );

              // Insert ChatOps button at the exact middle index of the array
              const midIndex = Math.floor(buttons.length / 2);
              buttons.splice(midIndex, 0, chatOpsBtn);

              return (
                <div className={`cta-buttons-group ${buttons.length > 6 ? "many-buttons" : ""}`}>
                  {buttons}
                </div>
              );
            })()}
          </div>
        </aside>
      </main>

      {showConnectModal && (() => {
        const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        const itemsStr = cartItems.map(item => `${item.name} (Qty: ${item.quantity})`).join(", ");
        let deliveryInfoText = "";
        if (requestDelivery && isHomeDeliverable) {
          deliveryInfoText = `. Delivery Requested: Yes. Address: ${customerAddress}. Coordinates: ${customerCoordinates ? `${customerCoordinates.latitude.toFixed(6)}, ${customerCoordinates.longitude.toFixed(6)}` : 'None'}. Distance: ${deliveryDistance} km. Delivery Rate: ₹${deliveryRate}`;
        } else {
          deliveryInfoText = `. Delivery Requested: No`;
        }

        // Compute appointment object for payload
        const computeAppointment = () => {
          if (!bookingDate) return undefined;
          if (requestDelivery && isHomeDeliverable) {
            if (bookingTimeFrom || bookingTimeTo) {
              return { date: bookingDate, timeFrom: bookingTimeFrom, timeTo: bookingTimeTo, type: "delivery_window" as const };
            }
            return { date: bookingDate, timeFrom: "", timeTo: "", type: "express" as const };
          }
          return { date: bookingDate, timeFrom: bookingTime, timeTo: "", type: "store_visit" as const };
        };
        const appointmentPayload = computeAppointment();

        let appointmentInfoText = "";
        if (appointmentPayload) {
          if (appointmentPayload.type === "store_visit") {
            appointmentInfoText = `. Appointment: Store Visit on ${appointmentPayload.date}${appointmentPayload.timeFrom ? ` at ${appointmentPayload.timeFrom}` : ''}`;
          } else if (appointmentPayload.type === "delivery_window") {
            appointmentInfoText = `. Appointment: Delivery Window on ${appointmentPayload.date} from ${appointmentPayload.timeFrom || '?'} to ${appointmentPayload.timeTo || '?'}`;
          } else {
            appointmentInfoText = `. Appointment: Express delivery on ${appointmentPayload.date} (~1 hour)`;
          }
        }

        const channelInfo = CHANNELS.find(c => c.key === activeChannel) || {
          label: "ChatOps",
          icon: <ChatOpsGlobe size="18px" />,
          placeholder: "Phone Number (e.g. +91 9876543210)",
          type: "phone"
        };

        const activeChannelLabel = activeChannel === "chatops" ? "ChatOps" : channelInfo.label;
        const activeChannelIcon = activeChannel === "chatops" ? <ChatOpsGlobe size="18px" /> : channelInfo.icon;
        const activeChannelPlaceholder = activeChannel === "chatops" ? "Phone Number (e.g. +91 9876543210)" : (channelInfo.placeholder || "Enter details");
        const activeChannelType = activeChannel === "chatops" ? "phone" : (channelInfo.type || "text");

        // Helper to check if user input is attempting a URL
        const isUrlLike = (text: string, keyword: string) => {
          const lower = text.toLowerCase();
          return (
            lower.startsWith("http") ||
            lower.startsWith("www") ||
            lower.includes("/") ||
            lower.includes(".") ||
            lower.includes(keyword)
          );
        };

        // Format raw user handle input to a full social URL if they didn't provide a domain name
        const formatContactValue = (channel: string, val: string): string => {
          if (!val) return "";
          const trimmed = val.trim();
          if (!trimmed) return "";

          const isUrl = (str: string) => {
            const lower = str.toLowerCase();
            return lower.startsWith("http://") || lower.startsWith("https://") || lower.includes(".com") || lower.includes(".me");
          };

          if (isUrl(trimmed)) {
            if (!trimmed.toLowerCase().startsWith("http://") && !trimmed.toLowerCase().startsWith("https://")) {
              return `https://${trimmed}`;
            }
            return trimmed;
          }

          switch (channel) {
            case "instagram": {
              const handle = trimmed.replace(/^@/, "");
              return `https://instagram.com/${handle}`;
            }
            case "telegram": {
              const handle = trimmed.replace(/^@/, "");
              return `https://t.me/${handle}`;
            }
            case "x": {
              const handle = trimmed.replace(/^@/, "");
              return `https://x.com/${handle}`;
            }
            case "tiktok": {
              const handle = trimmed.replace(/^@/, "");
              return `https://tiktok.com/@${handle}`;
            }
            case "youtube": {
              const handle = trimmed.replace(/^@/, "");
              return `https://youtube.com/@${handle}`;
            }
            case "facebook": {
              return `https://facebook.com/${trimmed}`;
            }
            case "linkedin": {
              if (trimmed.startsWith("in/")) {
                return `https://linkedin.com/${trimmed}`;
              }
              return `https://linkedin.com/in/${trimmed}`;
            }
            case "google": {
              return `https://google.com/${trimmed}`;
            }
            default:
              return trimmed;
          }
        };

        const isPhoneValid = (phone: string) => {
          if (!phone || !phone.startsWith("+") || !phone.includes(" ")) return false;
          
          const cleaned = phone.replace(/[^\d+ ]/g, "").trim();
          const firstSpaceIdx = cleaned.indexOf(" ");
          if (firstSpaceIdx === -1) return false;
          
          const countryPart = cleaned.slice(0, firstSpaceIdx);
          const numberPart = cleaned.slice(firstSpaceIdx + 1).replace(/\s/g, "");
          
          const match = COUNTRY_CODES.find(c => c.code === countryPart);
          if (match) {
            const numLen = numberPart.length;
            return numLen >= match.digits.min && numLen <= match.digits.max;
          }
          
          const totalDigits = cleaned.replace(/[^\d]/g, "").length;
          return totalDigits >= 8 && totalDigits <= 15;
        };

        const isFormValid = () => {
          // Name must be at least 2 characters (trimmed)
          if (customerName.trim().length < 2) return false;
          
          // WhatsApp / Phone / ChatOps
          if (activeChannelType === "phone") {
            const val = activeChannel === "whatsapp" ? contacts.whatsapp : contacts.phone;
            return isPhoneValid(val);
          }
          
          // Email
          if (activeChannel === "email") {
            const val = (contacts.email || "").trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(val);
          }
          
          // Instagram
          if (activeChannel === "instagram") {
            const val = (contacts.instagram || "").trim();
            if (!val) return false;
            
            if (isUrlLike(val, "instagram")) {
              if (!val.includes("instagram.com/")) return false;
              const parts = val.split("instagram.com/");
              const handle = parts[parts.length - 1].split(/[?#]/)[0].replace(/^@/, "").trim();
              return handle.length >= 3 && /^[a-zA-Z0-9._]+$/.test(handle);
            }
            
            const handle = val.replace(/^@/, "").trim();
            return handle.length >= 3 && /^[a-zA-Z0-9._]+$/.test(handle);
          }
          
          // Telegram
          if (activeChannel === "telegram") {
            const val = (contacts.telegram || "").trim();
            if (!val) return false;
            
            if (isUrlLike(val, "t.me") || isUrlLike(val, "telegram")) {
              const hasTgDomain = val.includes("t.me/") || val.includes("telegram.me/");
              if (!hasTgDomain) return false;
              const divider = val.includes("telegram.me/") ? "telegram.me/" : "t.me/";
              const parts = val.split(divider);
              const handle = parts[parts.length - 1].split(/[?#]/)[0].replace(/^@/, "").trim();
              return handle.length >= 5 && /^[a-zA-Z0-9_]+$/.test(handle);
            }
            
            const handle = val.replace(/^@/, "").trim();
            return handle.length >= 5 && /^[a-zA-Z0-9_]+$/.test(handle);
          }
          
          // X / Twitter
          if (activeChannel === "x") {
            const val = (contacts.x || "").trim();
            if (!val) return false;
            
            if (isUrlLike(val, "x.com") || isUrlLike(val, "twitter")) {
              const hasXDomain = val.includes("x.com/") || val.includes("twitter.com/");
              if (!hasXDomain) return false;
              const divider = val.includes("twitter.com/") ? "twitter.com/" : "x.com/";
              const parts = val.split(divider);
              const handle = parts[parts.length - 1].split(/[?#]/)[0].replace(/^@/, "").trim();
              return handle.length >= 4 && handle.length <= 15 && /^[a-zA-Z0-9_]+$/.test(handle);
            }
            
            const handle = val.replace(/^@/, "").trim();
            return handle.length >= 4 && handle.length <= 15 && /^[a-zA-Z0-9_]+$/.test(handle);
          }
          
          // TikTok
          if (activeChannel === "tiktok") {
            const val = (contacts.tiktok || "").trim();
            if (!val) return false;
            
            if (isUrlLike(val, "tiktok")) {
              if (!val.includes("tiktok.com/")) return false;
              const parts = val.split("tiktok.com/");
              const handle = parts[parts.length - 1].split(/[?#]/)[0].replace(/^\/?@/, "").trim();
              return handle.length >= 2 && /^[a-zA-Z0-9_.]+$/.test(handle);
            }
            
            const handle = val.replace(/^@/, "").trim();
            return handle.length >= 2 && /^[a-zA-Z0-9_.]+$/.test(handle);
          }
          
          // LinkedIn
          if (activeChannel === "linkedin") {
            const val = (contacts.linkedin || "").trim();
            if (!val) return false;
            
            if (isUrlLike(val, "linkedin")) {
              if (!val.includes("linkedin.com/")) return false;
              const parts = val.split("linkedin.com/");
              const sub = parts[parts.length - 1].trim();
              return sub.length >= 3;
            }
            return val.length >= 3;
          }
          
          // Facebook
          if (activeChannel === "facebook") {
            const val = (contacts.facebook || "").trim();
            if (!val) return false;
            
            if (isUrlLike(val, "facebook") || isUrlLike(val, "fb.com")) {
              const hasFbDomain = val.includes("facebook.com/") || val.includes("fb.com/");
              if (!hasFbDomain) return false;
              const divider = val.includes("facebook.com/") ? "facebook.com/" : "fb.com/";
              const parts = val.split(divider);
              const sub = parts[parts.length - 1].trim();
              return sub.length >= 3;
            }
            return val.length >= 3;
          }
          
          // YouTube
          if (activeChannel === "youtube") {
            const val = (contacts.youtube || "").trim();
            if (!val) return false;
            
            if (isUrlLike(val, "youtube") || isUrlLike(val, "youtu.be")) {
              const hasYtDomain = val.includes("youtube.com/") || val.includes("youtu.be/");
              return hasYtDomain;
            }
            const handle = val.replace(/^@/, "").trim();
            return handle.length >= 3;
          }
          
          // Rest of text/link channels (Google, Review, Threads)
          const val = (contacts[activeChannel] || "").trim();
          return val.length >= 3;
        };

        const handleConfirmConnection = async () => {
          try {
            setSubmittingMessage(true);
            
            // 1. Submit appointment if configured
            if (bookingDate && bookingTime) {
              try {
                const totalAmount = Object.values(totalsByCurrency).reduce((sum, val) => sum + val, 0);
                await createAppointment({
                  companySlug: company,
                  items: cartItems.map(item => ({
                    itemId: item.itemId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    currency: item.currency || "₹",
                  })),
                  appointmentDate: bookingDate,
                  appointmentTime: bookingTime,
                  totalAmount,
                });
              } catch (err) {
                console.error("Failed to save appointment:", err);
              }
            }

            // 2. Prepare contacts structure
            const activeContactVal = activeChannel === "whatsapp" 
              ? contacts.whatsapp 
              : activeChannel === "email" 
                ? contacts.email 
                : activeChannel === "phone" || activeChannel === "chatops"
                  ? contacts.phone
                  : contacts[activeChannel];

            const formattedContactVal = (activeChannel === "phone" || activeChannel === "chatops" || activeChannel === "email" || activeChannel === "whatsapp")
              ? activeContactVal
              : formatContactValue(activeChannel, activeContactVal || "");

            const dbContacts = {
              phone: (activeChannel === "phone" || activeChannel === "chatops") ? formattedContactVal : "",
              whatsapp: activeChannel === "whatsapp" ? formattedContactVal : "",
              email: activeChannel === "email" ? formattedContactVal : "",
              instagram: activeChannel === "instagram" ? formattedContactVal : "",
              telegram: activeChannel === "telegram" ? formattedContactVal : "",
              facebook: activeChannel === "facebook" ? formattedContactVal : "",
              youtube: activeChannel === "youtube" ? formattedContactVal : "",
              x: activeChannel === "x" ? formattedContactVal : "",
              tiktok: activeChannel === "tiktok" ? formattedContactVal : "",
              linkedin: activeChannel === "linkedin" ? formattedContactVal : "",
              google: activeChannel === "google" ? formattedContactVal : "",
              review: activeChannel === "review" ? formattedContactVal : "",
            };

            const contactText = `${activeChannelLabel.toUpperCase()}: ${formattedContactVal}`;
            const messageTemplate = `Hi! Inquiry regarding cart items: ${itemsStr}. Total items: ${totalItemsCount}. Customer: ${customerName} (${contactText})${deliveryInfoText}${appointmentInfoText}`;

            // 3. Save ChatOps Lead
            await createChatOpsMessage({
              companySlug: company,
              customerContacts: dbContacts,
              customerName,
              items: cartItems.map(item => ({
                itemId: item.itemId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                sku: item.sku || "",
                itemType: item.type || "product"
              })),
              messageTemplate,
              enquiryType: "cart" as const,
              communicationChannel: activeChannel,
              customerAddress,
              customerCoordinates,
              requestDelivery,
              deliveryDistance,
              deliveryRate,
              appointment: appointmentPayload,
              source: "website"
            });

            // 4. Open Social/Link Redirection if not chatops
            if (activeChannel !== "chatops") {
              const message = buildEnquiryMessage();
              const encodedMessage = encodeURIComponent(message);
              
              const phoneNumber =
                typeof profile?.phoneNumber === "object"
                  ? profile.phoneNumber?.phoneNumber
                  : profile?.phoneNumber || "";
              const countryCode =
                typeof profile?.phoneNumber === "object"
                  ? profile.phoneNumber?.countryCode || "+91"
                  : "+91";
              const cleanPhone = `${countryCode}${phoneNumber}`
                .replace(/\+/g, "")
                .replace(/\D/g, "");

              let link = "";
              if (activeChannel === "whatsapp") {
                const waProfile = profile?.whatsappProfile || cleanPhone;
                const cleanWA = waProfile.replace(/\+/g, "").replace(/\D/g, "");
                link = `https://wa.me/${cleanWA}?text=${encodedMessage}`;
              } else if (activeChannel === "telegram") {
                const tg = (profile?.telegramProfile || "").replace(/^@/, "").trim();
                link = `https://t.me/${tg}`;
              } else if (activeChannel === "instagram") {
                const ig = (profile?.instagramProfile || "").replace(/^@/, "").trim();
                link = ig.startsWith("http") ? ig : `https://instagram.com/${ig}`;
              } else if (activeChannel === "facebook") {
                const fb = profile?.facebookProfile || "";
                link = fb.startsWith("http") ? fb : `https://facebook.com/${fb}`;
              } else if (activeChannel === "youtube") {
                const yt = profile?.youtubeProfile || "";
                link = yt.startsWith("http") ? yt : `https://youtube.com/${yt.startsWith("@") ? yt : `@${yt}`}`;
              } else if (activeChannel === "x") {
                const xp = profile?.xProfile || "";
                link = xp.startsWith("http") ? xp : `https://x.com/${xp.startsWith("@") ? xp : `@${xp}`}`;
              } else if (activeChannel === "tiktok") {
                const tt = profile?.tiktokProfile || "";
                link = tt.startsWith("http") ? tt : `https://tiktok.com/${tt.startsWith("@") ? tt : `@${tt}`}`;
              } else if (activeChannel === "linkedin") {
                const li = profile?.linkedInProfile || "";
                link = li.startsWith("http") ? li : `https://linkedin.com/${li}`;
              } else if (activeChannel === "google") {
                const g = profile?.googleBusiness || "";
                link = g.startsWith("http") ? g : `https://google.com/${g}`;
              } else if (activeChannel === "review") {
                const rev = profile?.commentLink || "";
                link = rev.startsWith("http") ? rev : `https://${rev}`;
              } else if (activeChannel === "email") {
                link = `mailto:${profile?.mailId}?subject=Order%20Enquiry&body=${encodedMessage}`;
              } else if (activeChannel === "phone") {
                link = `tel:${cleanPhone}`;
              }

              if (link) {
                window.open(link, "_blank");
              }
            }

            setShowConnectModal(false);
            setShowSuccessOverlay(true);
          } catch (err) {
            console.error(err);
            alert("Failed to send connection details. Please try again.");
          } finally {
            setSubmittingMessage(false);
          }
        };

        const activeContactVal = activeChannel === "whatsapp" 
          ? contacts.whatsapp 
          : activeChannel === "email" 
            ? contacts.email 
            : activeChannel === "phone" || activeChannel === "chatops"
              ? contacts.phone
              : contacts[activeChannel];

        const previewContactVal = (activeChannel === "phone" || activeChannel === "chatops" || activeChannel === "email" || activeChannel === "whatsapp")
          ? activeContactVal
          : formatContactValue(activeChannel, activeContactVal || "");

        const contactText = previewContactVal ? `${activeChannelLabel.toUpperCase()}: ${previewContactVal}` : "Not provided";

        return (
          <div className="circltrade-modal-overlay" onClick={() => setShowConnectModal(false)}>
            <div className="circltrade-modal-container" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setShowConnectModal(false)}>
                &times;
              </button>
              <div className="modal-header">
                <div style={{ display: 'inline-flex', marginRight: '8px', color: 'var(--art-primary)', verticalAlign: 'middle' }}>
                  {activeChannelIcon}
                </div>
                <h2>Connect via {activeChannelLabel}</h2>
              </div>
              
              <div className="modal-body">
                <div className="globe-wrapper" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                  {activeChannel === "chatops" ? (
                    <ChatOpsGlobe className="transparent-globe" size={100} />
                  ) : (
                    <div className="social-large-icon" style={{ fontSize: '2.5rem', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--art-primary)' }}>
                      {activeChannelIcon}
                    </div>
                  )}
                </div>
                
                <div className="product-summary-card">
                  <h3>Cart Summary</h3>
                  <p className="sku-text">Total Unique Items: {cartItems.length}</p>
                  <div className="inventory-stats">
                    <span className="label">Total Quantity:</span>
                    <span className="value">{totalItemsCount} units</span>
                  </div>
                </div>

                <div className="social-inputs-fields">
                  {/* Name Input - Required for all */}
                  <div className={`input-group-row ${customerName && customerName.trim().length < 2 ? "invalid" : ""}`}>
                    <span className="input-icon"><UserIcon /></span>
                    <input 
                      type="text" 
                      placeholder="Your Name (Required)" 
                      value={customerName} 
                      onChange={(e) => setCustomerName(e.target.value)} 
                    />
                  </div>
                  {customerName && customerName.trim().length < 2 && (
                    <span className="field-error-msg">Name must be at least 2 characters long</span>
                  )}

                  {/* Channel-specific inputs */}
                  {activeChannelType === "phone" && (
                    <>
                      <PhoneInput
                        placeholder={activeChannelPlaceholder}
                        value={activeChannel === "whatsapp" ? (contacts.whatsapp || "") : (contacts.phone || "")}
                        onChange={(val) => setContacts(prev => ({ ...prev, [activeChannel === "whatsapp" ? "whatsapp" : "phone"]: val }))}
                        icon={activeChannelIcon}
                        className={(activeChannel === "whatsapp" ? contacts.whatsapp : contacts.phone) && !isPhoneValid(activeChannel === "whatsapp" ? contacts.whatsapp : contacts.phone) ? "invalid" : ""}
                      />
                      {(activeChannel === "whatsapp" ? contacts.whatsapp : contacts.phone) && !isPhoneValid(activeChannel === "whatsapp" ? contacts.whatsapp : contacts.phone) && (
                        <span className="field-error-msg">
                          Please enter format: +[CountryCode] [Number] (e.g. +91 9876543210)
                        </span>
                      )}
                    </>
                  )}

                  {activeChannelType === "email" && (() => {
                    const val = (contacts.email || "").trim();
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const isValid = !val || emailRegex.test(val);
                    return (
                      <>
                        <div className={`input-group-row ${!isValid ? "invalid" : ""}`}>
                          <span className="input-icon">{activeChannelIcon}</span>
                          <input 
                            type="email" 
                            placeholder={activeChannelPlaceholder} 
                            value={contacts.email || ""} 
                            onChange={(e) => setContacts(prev => ({ ...prev, email: e.target.value }))} 
                          />
                        </div>
                        {!isValid && (
                          <span className="field-error-msg">Please enter a valid email address (e.g. name@example.com)</span>
                        )}
                      </>
                    );
                  })()}

                  {activeChannelType === "text" && (() => {
                    const val = (contacts[activeChannel] || "").trim();
                    let isValid = true;
                    let errorMsg = "";

                    if (val) {
                      if (activeChannel === "instagram") {
                        if (isUrlLike(val, "instagram")) {
                          const hasDomain = val.includes("instagram.com/");
                          const parts = val.split("instagram.com/");
                          const handle = hasDomain ? parts[parts.length - 1].split(/[?#]/)[0].replace(/^@/, "").trim() : "";
                          isValid = hasDomain && handle.length >= 3 && /^[a-zA-Z0-9._]+$/.test(handle);
                        } else {
                          const handle = val.replace(/^@/, "").trim();
                          isValid = handle.length >= 3 && /^[a-zA-Z0-9._]+$/.test(handle);
                        }
                        errorMsg = "Enter a valid handle (min 3 chars) or URL (e.g. @username or instagram.com/username)";
                      } else if (activeChannel === "telegram") {
                        if (isUrlLike(val, "t.me") || isUrlLike(val, "telegram")) {
                          const hasTgDomain = val.includes("t.me/") || val.includes("telegram.me/");
                          const divider = val.includes("telegram.me/") ? "telegram.me/" : "t.me/";
                          const parts = val.split(divider);
                          const handle = hasTgDomain ? parts[parts.length - 1].split(/[?#]/)[0].replace(/^@/, "").trim() : "";
                          isValid = hasTgDomain && handle.length >= 5 && /^[a-zA-Z0-9_]+$/.test(handle);
                        } else {
                          const handle = val.replace(/^@/, "").trim();
                          isValid = handle.length >= 5 && /^[a-zA-Z0-9_]+$/.test(handle);
                        }
                        errorMsg = "Enter a valid handle (min 5 chars) or URL (e.g. @username or t.me/username)";
                      } else if (activeChannel === "x") {
                        if (isUrlLike(val, "x.com") || isUrlLike(val, "twitter")) {
                          const hasXDomain = val.includes("x.com/") || val.includes("twitter.com/");
                          const divider = val.includes("twitter.com/") ? "twitter.com/" : "x.com/";
                          const parts = val.split(divider);
                          const handle = hasXDomain ? parts[parts.length - 1].split(/[?#]/)[0].replace(/^@/, "").trim() : "";
                          isValid = hasXDomain && handle.length >= 4 && handle.length <= 15 && /^[a-zA-Z0-9_]+$/.test(handle);
                        } else {
                          const handle = val.replace(/^@/, "").trim();
                          isValid = handle.length >= 4 && handle.length <= 15 && /^[a-zA-Z0-9_]+$/.test(handle);
                        }
                        errorMsg = "Enter a valid handle (4-15 chars) or URL (e.g. @handle or x.com/handle)";
                      } else if (activeChannel === "tiktok") {
                        if (isUrlLike(val, "tiktok")) {
                          const hasDomain = val.includes("tiktok.com/");
                          const parts = val.split("tiktok.com/");
                          const handle = hasDomain ? parts[parts.length - 1].split(/[?#]/)[0].replace(/^\/?@/, "").trim() : "";
                          isValid = hasDomain && handle.length >= 2 && /^[a-zA-Z0-9_.]+$/.test(handle);
                        } else {
                          const handle = val.replace(/^@/, "").trim();
                          isValid = handle.length >= 2 && /^[a-zA-Z0-9_.]+$/.test(handle);
                        }
                        errorMsg = "Enter a valid handle (min 2 chars) or URL (e.g. @handle or tiktok.com/@handle)";
                      } else if (activeChannel === "linkedin") {
                        if (isUrlLike(val, "linkedin")) {
                          const hasDomain = val.includes("linkedin.com/");
                          const parts = val.split("linkedin.com/");
                          const sub = hasDomain ? parts[parts.length - 1].trim() : "";
                          isValid = hasDomain && sub.length >= 3;
                        } else {
                          isValid = val.length >= 3;
                        }
                        errorMsg = "Enter a valid profile name or URL (e.g. username or linkedin.com/in/username)";
                      } else if (activeChannel === "facebook") {
                        if (isUrlLike(val, "facebook") || isUrlLike(val, "fb.com")) {
                          const hasFbDomain = val.includes("facebook.com/") || val.includes("fb.com/");
                          const divider = val.includes("facebook.com/") ? "facebook.com/" : "fb.com/";
                          const parts = val.split(divider);
                          const sub = hasFbDomain ? parts[parts.length - 1].trim() : "";
                          isValid = hasFbDomain && sub.length >= 3;
                        } else {
                          isValid = val.length >= 3;
                        }
                        errorMsg = "Enter a valid profile name or URL (e.g. username or facebook.com/username)";
                      } else if (activeChannel === "youtube") {
                        if (isUrlLike(val, "youtube") || isUrlLike(val, "youtu.be")) {
                          isValid = val.includes("youtube.com/") || val.includes("youtu.be/");
                        } else {
                          const handle = val.replace(/^@/, "").trim();
                          isValid = handle.length >= 3;
                        }
                        errorMsg = "Enter a valid channel name or URL (e.g. @channel or youtube.com/@channel)";
                      } else {
                        isValid = val.length >= 3;
                        errorMsg = "Input must be at least 3 characters long";
                      }
                    }

                    return (
                      <>
                        <div className={`input-group-row ${!isValid ? "invalid" : ""}`}>
                          <span className="input-icon">{activeChannelIcon}</span>
                          <input 
                            type="text" 
                            placeholder={activeChannelPlaceholder} 
                            value={contacts[activeChannel] || ""} 
                            onChange={(e) => setContacts(prev => ({ ...prev, [activeChannel]: e.target.value }))} 
                          />
                        </div>
                        {!isValid && <span className="field-error-msg">{errorMsg}</span>}
                      </>
                    );
                  })()}
                </div>
                
                <div className="message-structure-container">
                  <div className="structure-header">
                    <span><PreviewIcon />MESSAGE PREVIEW</span>
                  </div>
                  <div className="structure-body">
                    <div className="chat-bubble">
                      <div className="sender-info">
                        <div className="sender-avatar">{customerName ? customerName.charAt(0).toUpperCase() : "U"}</div>
                        <span className="sender-name">{customerName || "Customer"}</span>
                        <span className="time-badge">Just now</span>
                      </div>
                      <div className="message-content">
                        <p><strong>Inquiry received:</strong></p>
                        <p>Items: {itemsStr}</p>
                        <p>Total Items: {totalItemsCount} units</p>
                        <p>Contacts: {contactText}</p>
                        <p>Company: {company.toUpperCase()}</p>
                        {appointmentPayload && (
                          <p style={{ color: '#ff8c00' }}>
                            {appointmentPayload.type === "store_visit" && `🏪 Store Visit: ${appointmentPayload.date}${appointmentPayload.timeFrom ? ` at ${appointmentPayload.timeFrom}` : ''}`}
                            {appointmentPayload.type === "delivery_window" && `🚚 Delivery Window: ${appointmentPayload.date} ${appointmentPayload.timeFrom || '?'} – ${appointmentPayload.timeTo || '?'}`}
                            {appointmentPayload.type === "express" && `⚡ Express: ${appointmentPayload.date} (~1 hour)`}
                          </p>
                        )}
                        <span className="action-tag">Click to connect and reply</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="confirm-connect-btn" 
                  onClick={handleConfirmConnection}
                  disabled={submittingMessage || !isFormValid()}
                >
                  {submittingMessage 
                    ? "Connecting..." 
                    : activeChannel === "chatops" 
                      ? "Connect ChatOps" 
                      : activeChannel === "phone" 
                        ? "Call Supplier" 
                        : activeChannel === "email" 
                          ? "Send Email" 
                          : `Connect on ${activeChannelLabel}`}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showSuccessOverlay && (
        <ChatOpsSuccessOverlay
          onComplete={() => {
            setShowSuccessOverlay(false);
            clearCart();
          }}
        />
      )}
    </div>
  );
}
