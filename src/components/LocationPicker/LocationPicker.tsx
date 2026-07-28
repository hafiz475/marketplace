"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface LocationPickerProps {
  location: { latitude: number; longitude: number } | null;
  onChange: (data: { latitude: number; longitude: number; address: string; countryCode?: string }) => void;
  className?: string;
  storeLocation?: { latitude: number; longitude: number } | null;
  companyName?: string;
  profileImage?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  location,
  onChange,
  className = "",
  storeLocation,
  companyName,
  profileImage,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const isMarkerAdded = useRef(false);
  const [loading, setLoading] = useState(false);

  // Helper: Nominatim reverse geocoding
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const address = data.display_name || "";
      const iso2 = (data.address?.country_code || "").toUpperCase();
      onChange({
        latitude: lat,
        longitude: lng,
        address,
        countryCode: iso2,
      });
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const initialLng = location?.longitude ?? storeLocation?.longitude ?? 78.9629; // Default to India/Store center
    const initialLat = location?.latitude ?? storeLocation?.latitude ?? 20.5937;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [initialLng, initialLat],
      zoom: location ? 13 : 5,
      attributionControl: false,
    });

    // Create store marker if coordinates exist
    if (storeLocation?.latitude && storeLocation?.longitude) {
      const storePopup = new maplibregl.Popup({ offset: 25 }).setText("Store Location");
      
      const el = document.createElement("div");
      el.style.display = "flex";
      el.style.flexDirection = "column";
      el.style.alignItems = "center";
      el.style.cursor = "pointer";

      const name = companyName || "Store";
      const profileImageHtml = profileImage 
        ? `<img src="${profileImage}" style="width: 100%; height: 100%; object-fit: cover;" />`
        : `<div style="color: #fff; font-weight: bold; font-size: 1.1rem; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #1a1a1a;">${name.charAt(0).toUpperCase()}</div>`;

      el.innerHTML = `
        <div style="background-color: #212b36; border: 1px solid #38424d; padding: 6px 12px; border-radius: 8px; display: flex; align-items: center; gap: 8px; color: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-family: sans-serif; font-size: 0.85rem; font-weight: bold; margin-bottom: 8px; white-space: nowrap; transform: translateY(-2px);">
          <span style="font-size: 1.1rem; display: flex; align-items: center;">🏪</span>
          <span>${name}</span>
        </div>
        <div style="width: 44px; height: 44px; border-radius: 50%; border: 3px solid #00c853; box-shadow: 0 0 15px rgba(0, 200, 83, 0.4); background-color: #111; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative;">
          ${profileImageHtml}
        </div>
      `;

      new maplibregl.Marker({ element: el })
        .setLngLat([storeLocation.longitude, storeLocation.latitude])
        .setPopup(storePopup)
        .addTo(map.current);
    }

    // Create customer marker (but don't add to map if location is null initially)
    marker.current = new maplibregl.Marker({ color: "#ff8c00", draggable: true })
      .setLngLat([initialLng, initialLat]);

    if (location) {
      marker.current.addTo(map.current);
      isMarkerAdded.current = true;
    }

    // Fit bounds if both coordinates exist
    if (location && storeLocation?.latitude && storeLocation?.longitude) {
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([location.longitude, location.latitude]);
      bounds.extend([storeLocation.longitude, storeLocation.latitude]);
      map.current.fitBounds(bounds, { padding: 60 });
    }

    // Click on map to place marker
    map.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      if (marker.current) {
        marker.current.setLngLat([lng, lat]);
        if (map.current && !isMarkerAdded.current) {
          marker.current.addTo(map.current);
          isMarkerAdded.current = true;
        }
      }
      reverseGeocode(lat, lng);
    });

    // Drag marker to get coordinates
    marker.current.on("dragend", () => {
      if (!marker.current) return;
      const lngLat = marker.current.getLngLat();
      reverseGeocode(lngLat.lat, lngLat.lng);
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update map center & marker position when external location changes
  useEffect(() => {
    if (!map.current || !marker.current) return;
    if (!location) {
      if (isMarkerAdded.current) {
        marker.current.remove();
        isMarkerAdded.current = false;
      }
      return;
    }

    if (!isMarkerAdded.current) {
      marker.current.addTo(map.current);
      isMarkerAdded.current = true;
    }

    const currentCenter = map.current.getCenter();
    if (
      Math.abs(currentCenter.lng - location.longitude) > 0.0001 ||
      Math.abs(currentCenter.lat - location.latitude) > 0.0001
    ) {
      map.current.setCenter([location.longitude, location.latitude]);
      map.current.setZoom(13);
      marker.current.setLngLat([location.longitude, location.latitude]);
    }
  }, [location]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        ref={mapContainer}
        className={`location-picker-map ${className}`}
        style={{ width: "100%", height: "250px", borderRadius: "12px", border: "1px solid #333", overflow: "hidden" }}
      />
      {loading && (
        <div style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "rgba(0,0,0,0.85)",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "6px",
          fontSize: "0.8rem",
          border: "1px solid #ff8c00",
          zIndex: 10
        }}>
          🔄 Fetching address...
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
