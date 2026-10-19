import { useMemo } from "react";
import { distanceInMeters, type LatLng } from "@/lib/geo";
import { applyParkingFilter, type ParkingFilter } from "@/components/parking/ParkingFilters";
import type { ParkingSpot } from "@/types/parking";

export interface ParkingSpotWithDistance extends ParkingSpot {
  distanceMeters: number;
}

/**
 * Combines the three ways this app's list/map narrow down parking spots:
 * free-text search (name/address), the type/free/verified filter chips,
 * and distance from the current (or fallback) location. Shared by Home
 * and Map so their results never drift out of sync with each other.
 */
export function useFilteredParking(
  spots: ParkingSpot[] | undefined,
  location: LatLng,
  search: string,
  filter: ParkingFilter
): ParkingSpotWithDistance[] {
  return useMemo(() => {
    if (!spots) return [];

    const withDistance: ParkingSpotWithDistance[] = spots.map((spot) => ({
      ...spot,
      distanceMeters: distanceInMeters(location, spot),
    }));

    const searchTerm = search.trim().toLowerCase();
    const searched = searchTerm
      ? withDistance.filter(
          (spot) =>
            spot.name.toLowerCase().includes(searchTerm) || spot.address?.toLowerCase().includes(searchTerm)
        )
      : withDistance;

    const filtered = applyParkingFilter(searched, filter);

    return [...filtered].sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [spots, location, search, filter]);
}
