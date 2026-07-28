"use client";

import React from "react";
import "./ChatOpsGlobe.scss";

interface ChatOpsGlobeProps {
  size?: number | string;
  className?: string;
}

export const ChatOpsGlobe: React.FC<ChatOpsGlobeProps> = ({
  size = 50,
  className = "",
}) => {
  return (
    <div
      className={`chatops-globe-container ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 50 50"
        className="globe-svg-chatops"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <mask id="globe-mask-clip-chatops-pub">
            <circle cx="25" cy="25" r="17.5" fill="white" />
          </mask>
          <linearGradient id="globe-multicolor-chatops-pub" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff4a4a" />
            <stop offset="33%" stopColor="#ffcc00" />
            <stop offset="66%" stopColor="#2ecc71" />
            <stop offset="100%" stopColor="#3498db" />
          </linearGradient>
        </defs>

        {/* Orbiting Whirl Arcs (Outside Sphere) */}
        <path
          d="M 6 22 A 20.5 20.5 0 0 1 44 22"
          fill="none"
          stroke="#ff4a4a"
          strokeWidth="1.2"
          strokeDasharray="25 8"
          className="whirl-arc-1-chatops"
        />
        <path
          d="M 44 28 A 20.5 20.5 0 0 1 6 28"
          fill="none"
          stroke="#3498db"
          strokeWidth="1.2"
          strokeDasharray="20 12"
          className="whirl-arc-2-chatops"
        />

        {/* Outer Sphere Boundary */}
        <circle
          cx="25"
          cy="25"
          r="18"
          fill="none"
          stroke="url(#globe-multicolor-chatops-pub)"
          strokeWidth="1.5"
        />

        {/* Grid and Continents (Masked inside the Sphere) */}
        <g mask="url(#globe-mask-clip-chatops-pub)">
          {/* Latitude & Longitude Grid */}
          <path d="M 7 25 L 43 25" stroke="#3498db" strokeWidth="0.6" opacity="0.35" />
          <path d="M 25 7 L 25 43" stroke="#3498db" strokeWidth="0.6" opacity="0.35" />
          <path d="M 25 7 Q 15 25 25 43" fill="none" stroke="#2ecc71" strokeWidth="0.6" opacity="0.25" />
          <path d="M 25 7 Q 35 25 25 43" fill="none" stroke="#2ecc71" strokeWidth="0.6" opacity="0.25" />
          <path d="M 10 16 Q 25 22 40 16" fill="none" stroke="#ffcc00" strokeWidth="0.6" opacity="0.25" />
          <path d="M 10 34 Q 25 28 40 34" fill="none" stroke="#ffcc00" strokeWidth="0.6" opacity="0.25" />

          {/* Continent outlines spinning group */}
          <g className="globe-spinning-group-chatops">
            {/* Set 1 */}
            <g className="continents-set">
              {/* Americas */}
              <path
                d="M 6 13 C 8 13, 10 15, 12 13 C 14 11, 16 15, 18 17 C 20 19, 19 23, 17 24 C 15 25, 16 27, 18 28 C 20 29, 19 31, 17 32 C 15 33, 16 37, 17 39 C 18 41, 16 43, 14 45 C 12 47, 11 45, 12 42 C 13 39, 12 37, 11 35 C 10 33, 8 31, 7 29 C 6 27, 7 25, 6 23 C 5 21, 4 18, 5 13 Z"
                fill="none"
                stroke="#ff4a4a"
                strokeWidth="1"
              />
              {/* Africa & Europe */}
              <path
                d="M 24 10 C 26 10, 27 12, 29 11 C 31 10, 33 12, 32 14 C 31 16, 33 18, 34 20 C 35 22, 33 24, 31 25 C 29 26, 30 28, 31 30 C 32 32, 30 34, 28 35 C 26 36, 25 39, 23 37 C 21 35, 20 32, 22 30 C 24 28, 23 26, 22 24 C 21 22, 23 18, 24 16 C 25 14, 23 12, 24 10 Z"
                fill="none"
                stroke="#ffcc00"
                strokeWidth="1"
              />
              {/* Asia */}
              <path
                d="M 37 14 C 39 14, 41 12, 43 13 C 45 14, 46 17, 44 19 C 42 21, 44 23, 42 25 C 40 27, 41 30, 39 32 C 37 34, 36 32, 35 29 C 34 26, 36 22, 35 20 C 34 18, 36 16, 37 14 Z"
                fill="none"
                stroke="#2ecc71"
                strokeWidth="1"
              />
              {/* Australia */}
              <path
                d="M 43 34 C 45 34, 46 36, 44 38 C 42 40, 40 38, 41 36 C 42 34, 42 34, 43 34 Z"
                fill="none"
                stroke="#3498db"
                strokeWidth="1"
              />
            </g>
            {/* Set 2 (for continuous infinite scroll) */}
            <g className="continents-set" transform="translate(45, 0)">
              {/* Americas */}
              <path
                d="M 6 13 C 8 13, 10 15, 12 13 C 14 11, 16 15, 18 17 C 20 19, 19 23, 17 24 C 15 25, 16 27, 18 28 C 20 29, 19 31, 17 32 C 15 33, 16 37, 17 39 C 18 41, 16 43, 14 45 C 12 47, 11 45, 12 42 C 13 39, 12 37, 11 35 C 10 33, 8 31, 7 29 C 6 27, 7 25, 6 23 C 5 21, 4 18, 5 13 Z"
                fill="none"
                stroke="#ff4a4a"
                strokeWidth="1"
              />
              {/* Africa & Europe */}
              <path
                d="M 24 10 C 26 10, 27 12, 29 11 C 31 10, 33 12, 32 14 C 31 16, 33 18, 34 20 C 35 22, 33 24, 31 25 C 29 26, 30 28, 31 30 C 32 32, 30 34, 28 35 C 26 36, 25 39, 23 37 C 21 35, 20 32, 22 30 C 24 28, 23 26, 22 24 C 21 22, 23 18, 24 16 C 25 14, 23 12, 24 10 Z"
                fill="none"
                stroke="#ffcc00"
                strokeWidth="1"
              />
              {/* Asia */}
              <path
                d="M 37 14 C 39 14, 41 12, 43 13 C 45 14, 46 17, 44 19 C 42 21, 44 23, 42 25 C 40 27, 41 30, 39 32 C 37 34, 36 32, 35 29 C 34 26, 36 22, 35 20 C 34 18, 36 16, 37 14 Z"
                fill="none"
                stroke="#2ecc71"
                strokeWidth="1"
              />
              {/* Australia */}
              <path
                d="M 43 34 C 45 34, 46 36, 44 38 C 42 40, 40 38, 41 36 C 42 34, 42 34, 43 34 Z"
                fill="none"
                stroke="#3498db"
                strokeWidth="1"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
