import { useEffect, useState } from "react";
import type { LatLng } from "@/lib/geo";

/**
 * Central Chennai — used whenever geolocation is unavailable, denied, or
 * still loading, so distance sorting and the map always have *something*
 * sensible to center on (this also matches where the demo seed data
 * lives, so the fallback experience still looks populated).
 */
export const DEFAULT_LOCATION: LatLng = { latitude: 13.0827, longitude: 80.2707 };

export type GeolocationStatus = "idle" | "loading" | "success" | "denied" | "unsupported" | "error";

interface GeolocationState {
  location: LatLng;
  /** True only once geolocation succeeded — false while loading or on fallback. */
  isPreciseLocation: boolean;
  status: GeolocationStatus;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    location: DEFAULT_LOCATION,
    isPreciseLocation: false,
    status: "idle",
  });

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setState((prev) => ({ ...prev, status: "unsupported" }));
      return;
    }

    setState((prev) => ({ ...prev, status: "loading" }));

    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setState({
          location: { latitude: position.coords.latitude, longitude: position.coords.longitude },
          isPreciseLocation: true,
          status: "success",
        });
      },
      (error) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          status: error.code === error.PERMISSION_DENIED ? "denied" : "error",
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
