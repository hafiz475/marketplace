"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Header from "../Header/Header";
import { getAvailableCountries, getCountryData } from "@/lib/api";
import { useRouter } from "next/navigation";

const MapLibreGlobe = () => {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const availableIso2 = useRef<Set<string>>(new Set());
  const [flagsLoaded, setFlagsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // ... (rest of the map initialization logic)

    // Initialize MapLibre with explicit Globe projection
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [0, 0],
      zoom: 1,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      // Native globe projection in v5.0+
      // @ts-ignore
      projection: "globe",
      renderWorldCopies: false,
      antialias: false, // Disabled for performance — big FPS boost
      dragRotate: false,
      boxZoom: false,
      maxTileCacheSize: 200, // Larger cache = fewer re-fetches on zoom
      fadeDuration: 150, // Faster tile fade-in
      maxPitch: 80,
      maxZoom: 20,
    });

    // Set inertia & smoothness — very slow, Google Earth feel
    map.current.dragPan.enable({
      deceleration: 800, // Gentle deceleration
      maxSpeed: 80, // Very slow panning
    });
    map.current.scrollZoom.enable();
    let userInteracting = false;
    let lastInteractionTime = Date.now();
    let animationFrameId: number;

    // Hoisted references for cleanup
    let onRotateMouseMove: ((e: MouseEvent) => void) | null = null;
    let onRotateMouseUp: (() => void) | null = null;

    // --- Global error handler to suppress DEM RangeErrors ---
    // MapLibre throws these synchronously inside its requestAnimationFrame render loop,
    // which we can't wrap in try-catch. This prevents Next.js error overlay from showing.
    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.error?.message || event.message || "";
      if (
        msg.includes("Out of range source coordinates") ||
        msg.includes("source coordinates for DEM") ||
        msg.includes("_onEaseFrame is not a function") ||
        (msg.includes("is not a function") && msg.includes("Ease")) ||
        (event.error instanceof RangeError && msg.includes("DEM")) ||
        (event.error instanceof TypeError && msg.includes("EaseFrame"))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    };
    window.addEventListener("error", handleGlobalError, true);

    // Also suppress via MapLibre's own error event
    map.current.on("error", (e: any) => {
      const msg = e?.error?.message || "";
      if (
        msg.includes("%.") ||
        msg.includes("Out of range") ||
        msg.includes("source coordinates")
      ) {
        return; // Silently ignore DEM coordinate overflow errors
      }
      console.warn("Map error:", e.error);
    });

    map.current.on("load", () => {
      if (!map.current) return;

      // Force Globe Projection (MapLibre v5.0+)
      try {
        // @ts-ignore
        map.current.setProjection({ type: "globe" });
      } catch (e) {
        console.warn("Globe projection failed:", e);
      }

      // Suppress missing sprite image warnings — create tiny transparent placeholders
      map.current.on("styleimagemissing", (e: any) => {
        if (!map.current) return;
        const id = e.id;
        if (!map.current.hasImage(id)) {
          map.current.addImage(id, {
            width: 1,
            height: 1,
            data: new Uint8Array([0, 0, 0, 0]),
          });
        }
      });

      // --- Hide country name labels (replaced by flag icons) ---
      // Note: only hide country labels. City/state/town labels have their own
      // minzoom in the base style so they naturally don't show at globe zoom.
      ["label_country_1", "label_country_2", "label_country_3"].forEach(
        (id) => {
          if (map.current!.getLayer(id)) {
            map.current!.setLayoutProperty(id, "visibility", "none");
          }
        },
      );

      // --- Country Flag Icons (Native Symbol Layer — renders ON the globe) ---
      // Fetch country centroids from API and build flag layer
      const initCountryFlags = async () => {
        if (!map.current) return;
        try {
          const data = await getCountryData();
          if (!data?.success || !data?.countryData) return;

          const countryData: Record<
            string,
            { lat: number; lng: number; name: string }
          > = data.countryData;
          const isos = Object.keys(countryData);

          // Build GeoJSON features
          const flagFeatures = Object.entries(countryData).map(
            ([iso, { lng, lat, name }]) => ({
              type: "Feature" as const,
              properties: { iso: iso.toLowerCase(), name },
              geometry: { type: "Point" as const, coordinates: [lng, lat] },
            }),
          );

          if (!map.current) return;
          map.current.addSource("country-flags", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: flagFeatures,
            },
          });

          // Resolve the actual font family name from the CSS variable assigned in layout
          let canvasFontFamily = "'Caveat', cursive";
          if (typeof window !== "undefined") {
            const computedFont = getComputedStyle(document.body)
              .getPropertyValue("--font-caveat")
              .trim();
            if (computedFont)
              canvasFontFamily = `${computedFont}, 'Caveat', cursive`;
          }

          // Format is "400 120px 'Font Family'"
          const fontSize = 120;
          const fontString = `400 ${fontSize}px ${canvasFontFamily}`;

          // Wait for custom font to load before drawing labels
          try {
            // @ts-ignore — browsers support document.fonts
            await document.fonts.load(fontString);
          } catch (e) {
            console.warn("Failed to wait for document fonts", e);
          }

          // Helper to create a high-DPI text label image via Canvas
          const createLabelImage = (text: string) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return null;

            ctx.font = fontString;
            const metrics = ctx.measureText(text);

            // Add generous padding for halo
            const padding = 20;
            canvas.width = metrics.width + padding * 2;
            canvas.height = fontSize + padding * 2;

            // Draw text with halo
            ctx.font = fontString;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            // Light Halo/Shadow for black text
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 12; // Thicker halo for larger text
            ctx.lineJoin = "round";
            ctx.strokeText(text, canvas.width / 2, canvas.height / 2);

            // Main text (Black)
            ctx.fillStyle = "#000000";
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            return ctx.getImageData(0, 0, canvas.width, canvas.height);
          };

          // Batch generate and add label images
          for (const iso of isos) {
            if (!map.current) break;
            const imgId = `label-${iso.toLowerCase()}`;
            if (map.current.hasImage(imgId)) continue;

            const name = countryData[iso].name;
            const imgData = createLabelImage(name);
            if (imgData) {
              // High pixel ratio to keep it sharp
              map.current.addImage(imgId, imgData, { pixelRatio: 4 });
            }
          }

          // Add the label layer using our custom images
          if (!map.current || map.current.getLayer("country-labels")) return;
          map.current.addLayer({
            id: "country-labels",
            type: "symbol",
            source: "country-flags",
            maxzoom: 6,
            layout: {
              "icon-image": ["concat", "label-", ["get", "iso"]],
              "icon-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                1,
                0.4, // Large even at zoom 1
                3,
                0.6,
                5,
                0.9,
              ],
              "icon-allow-overlap": false,
              "icon-ignore-placement": false,
              "icon-padding": 5,
            },
            paint: {
              "icon-opacity": ["interpolate", ["linear"], ["zoom"], 5, 1, 6, 0],
            },
          });

          // Mark flags as loaded
          setFlagsLoaded(true);
        } catch (err) {
          console.warn("Failed to load country flags:", err);
          setFlagsLoaded(true); // Hide loader even on error
        }
      };

      initCountryFlags();

      // High-performance smooth interaction settings — very slow
      map.current.dragPan.enable({
        deceleration: 800,
        maxSpeed: 80,
      });
      map.current.scrollZoom.enable();
      map.current.doubleClickZoom.enable();
      map.current.touchZoomRotate.enable();

      // Very slow scroll/wheel zoom for smooth experience
      try {
        // @ts-ignore — internal API for zoom rate
        map.current.scrollZoom.setWheelZoomRate(1 / 600);
        // @ts-ignore
        map.current.scrollZoom.setZoomRate(1 / 300);
      } catch (_e) {
        /* ignore if API is unavailable */
      }

      // Prevent text selection on shift+drag (enable rotation feel)
      const canvas = map.current.getCanvas();
      canvas.addEventListener("selectstart", (e) => e.preventDefault());
      canvas.style.userSelect = "none";

      // --- Custom Slow Rotation Handler (Ctrl+drag & Shift+drag) ---
      // Replaces built-in dragRotate with much slower, smoother feel
      let isRotating = false;
      let rotateStartX = 0;
      let rotateStartY = 0;
      let startBearing = 0;
      let startPitch = 0;
      const BEARING_SENSITIVITY = 0.15; // degrees per pixel — very slow
      const PITCH_SENSITIVITY = 0.1; // degrees per pixel — very slow

      const onRotateMouseDown = (e: MouseEvent) => {
        // Activate on Ctrl+click or Shift+click or right-click
        if (e.ctrlKey || e.shiftKey || e.button === 2) {
          if (!map.current) return;
          isRotating = true;
          rotateStartX = e.clientX;
          rotateStartY = e.clientY;
          startBearing = map.current.getBearing();
          startPitch = map.current.getPitch();
          e.preventDefault();
          canvas.style.cursor = "move";
        }
      };

      onRotateMouseMove = (e: MouseEvent) => {
        if (!isRotating || !map.current) return;
        const dx = e.clientX - rotateStartX;
        const dy = e.clientY - rotateStartY;

        const newBearing = startBearing + dx * BEARING_SENSITIVITY;
        const newPitch = Math.max(
          0,
          Math.min(80, startPitch - dy * PITCH_SENSITIVITY),
        );

        try {
          map.current.jumpTo({ bearing: newBearing, pitch: newPitch });
        } catch (_err) {
          // Suppress any DEM errors during rotation
        }
      };

      onRotateMouseUp = () => {
        if (isRotating) {
          isRotating = false;
          if (canvas) canvas.style.cursor = "grab";
        }
      };

      canvas.addEventListener("mousedown", onRotateMouseDown);
      window.addEventListener("mousemove", onRotateMouseMove);
      window.addEventListener("mouseup", onRotateMouseUp);
      canvas.addEventListener("contextmenu", (e) => e.preventDefault());

      // --- Atmosphere & Sky (Premium Look) ---
      try {
        // @ts-ignore
        map.current.setSky({
          "sky-color": "#88C6FC", // Vibrant blue sky
          "sky-horizon-blend": 0.5,
          "horizon-color": "#ffffff",
          "horizon-fog-blend": 0.8,
          "fog-color": "#ffffff",
          "fog-ground-blend": 0.6,
          "atmosphere-blend": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            1.0, // Full atmosphere at distance
            10,
            0.0, // Fade out when zooming in for clarity
          ],
        });
      } catch (e) {
        console.warn("Sky/Atmosphere initialization failed:", e);
      }

      // --- 3D Terrain (AWS Open Data — reliable & fast) ---
      try {
        map.current.addSource("terrain", {
          type: "raster-dem",
          tiles: [
            "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
          ],
          encoding: "terrarium",
          tileSize: 256,
          maxzoom: 5, // Globe-view only — no DEM processing when zoomed in
        });
        // @ts-ignore
        map.current.setTerrain({ source: "terrain", exaggeration: 1.2 });
      } catch (e) {
        console.warn("Terrain initialization failed:", e);
      }

      // --- 3D Buildings ---
      // Use the existing openmaptiles source from the Liberty style
      // instead of adding a duplicate vector source
      const existingSource = map.current.getSource("openmaptiles");

      // Remove any existing building extrusion layers from the base style
      // These can cause lag at mid-zoom levels
      const styleLayers = map.current.getStyle().layers || [];
      for (const layer of styleLayers) {
        if (layer.type === "fill-extrusion" && layer.id !== "3d-buildings") {
          map.current.removeLayer(layer.id);
        }
      }

      map.current.addLayer({
        id: "3d-buildings",
        source: existingSource ? "openmaptiles" : "openfreemap-buildings",
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 17,
        paint: {
          "fill-extrusion-color": "#ffffff",
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            17,
            0,
            17.05,
            ["get", "render_height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            17,
            0,
            17.05,
            ["get", "render_min_height"],
          ],
          "fill-extrusion-opacity": 0.5,
        },
      });

      // --- Country Hover Layers ---
      map.current.addSource("countries", {
        type: "geojson",
        data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_countries.geojson",
        generateId: true,
      });

      // Fetch available countries and build the ISO2 lookup set
      getAvailableCountries()
        .then((data) => {
          if (data.success && data.countries) {
            availableIso2.current = new Set(
              data.countries.map((c: { iso2: string }) => c.iso2.toUpperCase()),
            );
          }
        })
        .catch(console.error);

      // Neon orange fill layer (invisible, but captures hover/click events)
      map.current.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-color": "#ff6b35",
          "fill-opacity": 0, // No fill inside, just to capture mouse events
        },
      });

      // Neon orange border highlight on hover
      map.current.addLayer({
        id: "countries-border",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#ff6b35",
          "line-width": 2,
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.9,
            0,
          ],
        },
      });

      // Outer glow border for neon effect
      map.current.addLayer({
        id: "countries-glow",
        type: "line",
        source: "countries",
        paint: {
          "line-color": "#ff8c5a",
          "line-width": 4,
          "line-blur": 3,
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.5,
            0,
          ],
        },
      });

      // Hover state management — only for available countries
      let hoveredStateId: number | string | null = null;

      map.current.on("mousemove", "countries-fill", (e: any) => {
        if (!map.current) return;
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const iso = (feature.properties?.iso_a2 || "").toUpperCase();

          // Only highlight countries that have stores
          if (
            availableIso2.current.size > 0 &&
            !availableIso2.current.has(iso)
          ) {
            // Not an available country — clear any existing hover and ignore
            if (hoveredStateId !== null) {
              map.current.setFeatureState(
                { source: "countries", id: hoveredStateId },
                { hover: false },
              );
              hoveredStateId = null;
            }
            map.current.getCanvas().style.cursor = "grab";
            return;
          }

          // Clear previous hover
          if (hoveredStateId !== null) {
            map.current.setFeatureState(
              { source: "countries", id: hoveredStateId },
              { hover: false },
            );
          }
          hoveredStateId = feature.id;
          map.current.setFeatureState(
            { source: "countries", id: hoveredStateId as number },
            { hover: true },
          );
          map.current.getCanvas().style.cursor = "pointer";
        }
      });

      // Click handler for navigation
      map.current.on("click", "countries-fill", (e: any) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        const feature = e.features[0];
        const iso = (feature.properties?.iso_a2 || "").toUpperCase();

        if (availableIso2.current.has(iso)) {
          router.push(`/search?country=${iso.toLowerCase()}`);
        }
      });

      map.current.on("mouseleave", "countries-fill", () => {
        if (!map.current) return;
        if (hoveredStateId !== null) {
          map.current.setFeatureState(
            { source: "countries", id: hoveredStateId },
            { hover: false },
          );
        }
        hoveredStateId = null;
        map.current.getCanvas().style.cursor = "grab";
      });

      // Auto-rotation engine using longitude for a natural spin
      const animate = () => {
        if (!map.current) return;

        const now = Date.now();
        const timeSinceLastInteraction = now - lastInteractionTime;

        // Only rotate if zoomed out and not interacting
        if (!userInteracting && timeSinceLastInteraction > 3000) {
          const zoom = map.current.getZoom();
          if (zoom < 4) {
            const center = map.current.getCenter();
            center.lng -= 0.1;
            map.current.setCenter(center);
          }
        }

        animationFrameId = requestAnimationFrame(animate);
      };

      // Interaction listeners to pause auto-rotate
      const handleInteractionStart = () => {
        userInteracting = true;
        lastInteractionTime = Date.now();
      };

      const handleInteractionEnd = () => {
        userInteracting = false;
        lastInteractionTime = Date.now();
      };

      map.current.on("mousedown", handleInteractionStart);
      map.current.on("touchstart", handleInteractionStart);
      map.current.on("wheel", handleInteractionStart);
      map.current.on("dragstart", handleInteractionStart);

      map.current.on("mouseup", handleInteractionEnd);
      map.current.on("touchend", handleInteractionEnd);
      map.current.on("dragend", handleInteractionEnd);
      map.current.on("zoomend", handleInteractionEnd);

      // --- Terrain Toggle (on every zoom tick — instant, no animation) ---
      let terrainEnabled = true;

      map.current.on("zoom", () => {
        if (!map.current) return;
        const zoom = map.current.getZoom();

        if (zoom > 5 && terrainEnabled) {
          try {
            // @ts-ignore
            map.current.setTerrain(null);
          } catch (_e) {
            /* ignore */
          }
          terrainEnabled = false;
        } else if (zoom <= 5 && !terrainEnabled) {
          try {
            // @ts-ignore
            map.current.setTerrain({ source: "terrain", exaggeration: 1.2 });
          } catch (_e) {
            /* ignore */
          }
          terrainEnabled = true;
        }
      });

      // --- Smooth Camera Tilt (on zoomend — no overlap with active zoom) ---
      map.current.on("zoomend", () => {
        if (!map.current || isRotating) return;
        const zoom = map.current.getZoom();

        if (zoom > 14) {
          const targetPitch = Math.min(60, (zoom - 14) * 30);
          const currentPitch = map.current.getPitch();
          if (Math.abs(currentPitch - targetPitch) > 2) {
            try {
              map.current.easeTo({ pitch: targetPitch, duration: 500 });
            } catch (_e) {
              /* suppress */
            }
          }
        } else {
          if (map.current.getPitch() > 0 && !userInteracting) {
            try {
              map.current.easeTo({ pitch: 0, duration: 500 });
            } catch (_e) {
              /* suppress */
            }
          }
        }
      });

      // Start the animation loop
      animate();
    });

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (onRotateMouseMove)
        window.removeEventListener("mousemove", onRotateMouseMove);
      if (onRotateMouseUp)
        window.removeEventListener("mouseup", onRotateMouseUp);
      window.removeEventListener("error", handleGlobalError, true);
      map.current?.remove();
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "radial-gradient(circle at center, #0a0a20 0%, #000 100%)",
      }}
    >
      <Header />

      {/* Loading overlay while flags are being fetched */}
      {!flagsLoaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at center, #0a0a20 0%, #000 100%)",
            zIndex: 50,
            gap: "16px",
          }}
        >
          <div className="globe-loader" />
          <span
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 14,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Loading globe…
          </span>
        </div>
      )}

      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100%" }}
        className="maplibre-globe-canvas"
      />

      <style jsx global>{`
        .maplibre-globe-canvas .maplibregl-canvas {
          cursor: grab !important;
        }
        .maplibre-globe-canvas .maplibregl-canvas:active {
          cursor: grabbing !important;
        }

        /* Globe loader spinner */
        .globe-loader {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.15);
          border-top-color: rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: globe-spin 0.8s linear infinite;
        }
        @keyframes globe-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MapLibreGlobe;
