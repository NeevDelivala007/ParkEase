import L from "leaflet";
import type { ParkingSpot } from "@/types/parking";

/**
 * Leaflet's default marker icon references image files by a relative path
 * that breaks under most bundlers (including Vite) unless manually
 * patched. Sidestepping that entirely by building markers as inline SVG
 * divIcons — no external image assets, no path issues.
 */

function pinSvg(fill: string, strokeDasharray?: string): string {
  return `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z"
        fill="${fill}"
        stroke="white"
        stroke-width="1.5"
        ${strokeDasharray ? `stroke-dasharray="${strokeDasharray}"` : ""}
      />
      <circle cx="15" cy="15" r="6" fill="white" />
    </svg>
  `;
}

const COLORS = {
  PUBLIC: "#1d4ed8", // primary-ish blue
  PRIVATE: "#0ea5e9", // accent sky
  COMMUNITY_VERIFIED: "#16a34a", // success green
  COMMUNITY_UNVERIFIED: "#f59e0b", // warning amber
} as const;

function colorFor(spot: Pick<ParkingSpot, "type" | "verificationStatus">): string {
  if (spot.type === "COMMUNITY") {
    return spot.verificationStatus === "COMMUNITY_VERIFIED" ? COLORS.COMMUNITY_VERIFIED : COLORS.COMMUNITY_UNVERIFIED;
  }
  return spot.type === "PUBLIC" ? COLORS.PUBLIC : COLORS.PRIVATE;
}

export function createParkingIcon(spot: Pick<ParkingSpot, "type" | "verificationStatus">, isSelected = false): L.DivIcon {
  const color = colorFor(spot);
  // Community markers get a dashed outline in addition to color, so they
  // stay visually distinct even for color-blind users.
  const dash = spot.type === "COMMUNITY" ? "2,1.5" : undefined;

  return L.divIcon({
    className: "parkease-marker",
    html: `<div style="transform: ${isSelected ? "scale(1.25)" : "scale(1)"}; transition: transform 120ms ease; filter: ${
      isSelected ? "drop-shadow(0 4px 6px rgb(0 0 0 / 0.35))" : "drop-shadow(0 2px 3px rgb(0 0 0 / 0.25))"
    };">${pinSvg(color, dash)}</div>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
}

export function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: "parkease-user-marker",
    html: `
      <div style="position: relative; width: 20px; height: 20px;">
        <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(29,78,216,0.25); animation: parkease-pulse 2s ease-out infinite;"></div>
        <div style="position: absolute; inset: 5px; border-radius: 9999px; background: #1d4ed8; border: 2px solid white; box-shadow: 0 1px 3px rgb(0 0 0 / 0.4);"></div>
      </div>
      <style>
        @keyframes parkease-pulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      </style>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}
