import { cn } from "@/lib/utils";

export type ParkingFilter = "ALL" | "PUBLIC" | "PRIVATE" | "COMMUNITY" | "FREE" | "VERIFIED";

const filters: { value: ParkingFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Private" },
  { value: "COMMUNITY", label: "Community" },
  { value: "FREE", label: "Free" },
  { value: "VERIFIED", label: "Verified" },
];

interface ParkingFiltersProps {
  value: ParkingFilter;
  onChange: (value: ParkingFilter) => void;
}

export function ParkingFilters({ value, onChange }: ParkingFiltersProps) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === filter.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-secondary"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

/** Shared filter-predicate so Home and Map apply the exact same rules. */
export function applyParkingFilter<T extends { type: string; verificationStatus: string; pricePerHour: string | null }>(
  spots: T[],
  filter: ParkingFilter
): T[] {
  switch (filter) {
    case "PUBLIC":
      return spots.filter((s) => s.type === "PUBLIC");
    case "PRIVATE":
      return spots.filter((s) => s.type === "PRIVATE");
    case "COMMUNITY":
      return spots.filter((s) => s.type === "COMMUNITY");
    case "FREE":
      return spots.filter((s) => s.pricePerHour === null || Number(s.pricePerHour) === 0);
    case "VERIFIED":
      return spots.filter((s) => s.verificationStatus === "COMMUNITY_VERIFIED");
    case "ALL":
    default:
      return spots;
  }
}
