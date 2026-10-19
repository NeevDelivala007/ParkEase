export type ParkingType = "PUBLIC" | "PRIVATE" | "COMMUNITY";

export type ParkingVerificationStatus =
  | "UNDER_REVIEW"
  | "COMMUNITY_SUBMITTED"
  | "COMMUNITY_VERIFIED"
  | "REJECTED";

export type ParkingSpotStatus = "ACTIVE" | "INACTIVE" | "CLOSED";

export interface ParkingImage {
  id: string;
  parkingSpotId: string;
  uploadedById: string | null;
  imageUrl: string;
  createdAt: string;
}

export interface ParkingSpot {
  id: string;
  name: string;
  description: string | null;
  type: ParkingType;
  address: string | null;
  latitude: number;
  longitude: number;
  totalCapacity: number | null;
  availableCapacity: number | null;
  /** Serialized as a string by Prisma's Decimal -> JSON conversion. */
  pricePerHour: string | null;
  openingTime: string | null;
  closingTime: string | null;
  verificationStatus: ParkingVerificationStatus;
  status: ParkingSpotStatus;
  lastUpdated: string | null;
  submittedById: string | null;
  createdAt: string;
  updatedAt: string;
  images: ParkingImage[];
  verifyCount: number;
  reportCount: number;
}

export type VerificationType = "VERIFY" | "REPORT";

export interface Verification {
  id: string;
  parkingSpotId: string;
  userId: string;
  type: VerificationType;
  comment: string | null;
  createdAt: string;
  user: { id: string; name: string };
}

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: string;
  userId: string;
  parkingSpotId: string;
  startTime: string;
  endTime: string;
  amount: string;
  status: BookingStatus;
  createdAt: string;
  parkingSpot: {
    id: string;
    name: string;
    address: string | null;
    type: ParkingType;
    latitude: number;
    longitude: number;
  };
}
