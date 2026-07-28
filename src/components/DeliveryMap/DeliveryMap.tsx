"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface DeliveryMapProps {
  lat: number;
  lng: number;
  radiusKm?: number;
  countries?: { name: string; rate: string }[];
  mode: "national" | "international";
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  lat,
  lng,
  radiusKm,
  countries,
  mode,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [lng, lat],
      zoom: mode === "national" ? 10 : 2,
      attributionControl: false,
    });

    map.current.on("load", () => {
      if (!map.current) return;

      if (mode === "national") {
        // Add store marker
        new maplibregl.Marker({ color: "#ff6b35" })
          .setLngLat([lng, lat])
          .addTo(map.current);

        if (radiusKm) {
          // Add radius circle
          const circleData = createGeoJSONCircle([lng, lat], radiusKm);
          map.current.addSource("radius", {
            type: "geojson",
            data: circleData,
          });

          map.current.addLayer({
            id: "radius-fill",
            type: "fill",
            source: "radius",
            paint: {
              "fill-color": "#ff6b35",
              "fill-opacity": 0.2,
            },
          });

          map.current.addLayer({
            id: "radius-outline",
            type: "line",
            source: "radius",
            paint: {
              "line-color": "#ff6b35",
              "line-width": 2,
            },
          });

          // Fit bounds to circle
          const bounds = new maplibregl.LngLatBounds();
          circleData.geometry.coordinates[0].forEach((coord: any) => {
            bounds.extend(coord as [number, number]);
          });
          map.current.fitBounds(bounds, { padding: 50 });
        } else {
          // No radius limit - just center on marker
          map.current.setZoom(5);
        }
      } else if (mode === "international" && countries) {
         // Potential: Highlight countries if we have a GeoJSON of countries
         // For now, let's just show markers or markers at centroids
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [lat, lng, radiusKm, countries, mode]);

  return (
    <div
      ref={mapContainer}
      className="delivery-map-container"
      style={{ width: "100%", height: "250px", borderRadius: "12px", overflow: "hidden" }}
    />
  );
};

// Helper to create a GeoJSON circle
function createGeoJSONCircle(center: [number, number], radiusInKm: number, points = 64) {
  const coords = {
    latitude: center[1],
    longitude: center[0],
  };

  const km = radiusInKm;
  const ret = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  let theta, x, y;
  for (let i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI);
    x = distanceX * Math.cos(theta);
    y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: "Feature" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [ret],
    },
    properties: {},
  };
}

export default DeliveryMap;
