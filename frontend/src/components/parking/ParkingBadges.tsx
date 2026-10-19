import { Badge } from "@/components/ui/badge";
import type { ParkingSpot, ParkingType, ParkingVerificationStatus } from "@/types/parking";

const typeLabels: Record<ParkingType, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  COMMUNITY: "Community",
};

export function ParkingTypeBadge({ type }: { type: ParkingType }) {
  return <Badge variant={type === "COMMUNITY" ? "accent" : "secondary"}>{typeLabels[type]}</Badge>;
}

const verificationLabels: Record<ParkingVerificationStatus, string> = {
  UNDER_REVIEW: "Under review",
  COMMUNITY_SUBMITTED: "Community Submitted",
  COMMUNITY_VERIFIED: "Community Verified",
  REJECTED: "Rejected",
};

const verificationVariants: Record<ParkingVerificationStatus, "success" | "warning" | "outline" | "destructive"> = {
  UNDER_REVIEW: "outline",
  COMMUNITY_SUBMITTED: "warning",
  COMMUNITY_VERIFIED: "success",
  REJECTED: "destructive",
};

export function VerificationBadge({ status }: { status: ParkingVerificationStatus }) {
  return <Badge variant={verificationVariants[status]}>{verificationLabels[status]}</Badge>;
}

/** "Free", "₹20/hr" */
export function formatPrice(pricePerHour: string | null): string {
  if (pricePerHour === null) return "Free";
  const value = Number(pricePerHour);
  if (Number.isNaN(value) || value === 0) return "Free";
  return `₹${value % 1 === 0 ? value : value.toFixed(2)}/hr`;
}

/** "12 / 50 slots", "Full", "Unknown" */
export function formatAvailability(spot: Pick<ParkingSpot, "availableCapacity" | "totalCapacity">): string {
  if (spot.availableCapacity === null) return "Availability unknown";
  if (spot.availableCapacity === 0) return "Full";
  if (spot.totalCapacity !== null) return `${spot.availableCapacity} / ${spot.totalCapacity} slots`;
  return `${spot.availableCapacity} slots available`;
}
