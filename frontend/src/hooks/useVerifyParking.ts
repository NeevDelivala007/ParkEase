import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ParkingVerificationStatus } from "@/types/parking";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface VerificationResult {
  verifyCount: number;
  reportCount: number;
  verificationStatus: ParkingVerificationStatus;
}

async function verifyRequest(spotId: string, userId: string, comment?: string): Promise<VerificationResult> {
  const { data } = await api.post<ApiSuccess<VerificationResult>>(`/parking/${spotId}/verify`, {
    userId,
    comment,
  });
  return data.data;
}

/** Matches the backend's fixed report-reason set exactly. */
export const reportReasons = [
  "NO_LONGER_AVAILABLE",
  "PRIVATE_OR_RESTRICTED",
  "NO_PARKING_ALLOWED",
  "WRONG_LOCATION",
  "UNSAFE",
  "DUPLICATE",
] as const;
export type ReportReason = (typeof reportReasons)[number];

export const reportReasonLabels: Record<ReportReason, string> = {
  NO_LONGER_AVAILABLE: "No longer available",
  PRIVATE_OR_RESTRICTED: "Private/restricted",
  NO_PARKING_ALLOWED: "No parking allowed",
  WRONG_LOCATION: "Wrong location",
  UNSAFE: "Unsafe",
  DUPLICATE: "Duplicate",
};

async function reportRequest(
  spotId: string,
  userId: string,
  reason: ReportReason,
  comment?: string
): Promise<VerificationResult> {
  const { data } = await api.post<ApiSuccess<VerificationResult>>(`/parking/${spotId}/report`, {
    userId,
    reason,
    comment,
  });
  return data.data;
}

function useInvalidateAfterAction(spotId: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["parking-spot", spotId] });
    queryClient.invalidateQueries({ queryKey: ["parking-spots"] });
  };
}

export function useVerifyParkingSpot(spotId: string) {
  const invalidate = useInvalidateAfterAction(spotId);
  return useMutation({
    mutationFn: ({ userId, comment }: { userId: string; comment?: string }) => verifyRequest(spotId, userId, comment),
    onSuccess: invalidate,
  });
}

export function useReportParkingSpot(spotId: string) {
  const invalidate = useInvalidateAfterAction(spotId);
  return useMutation({
    mutationFn: ({ userId, reason, comment }: { userId: string; reason: ReportReason; comment?: string }) =>
      reportRequest(spotId, userId, reason, comment),
    onSuccess: invalidate,
  });
}
