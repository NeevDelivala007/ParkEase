import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ParkingSpot } from "@/types/parking";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface CreateParkingSpotPayload {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  totalCapacity?: number;
  pricePerHour?: number;
  openingTime?: string;
  closingTime?: string;
  submittedById: string;
  images: File[];
}

async function createParkingSpotRequest(payload: CreateParkingSpotPayload): Promise<ParkingSpot> {
  const form = new FormData();
  form.append("name", payload.name);
  form.append("type", "COMMUNITY"); // the frontend can only ever submit COMMUNITY spots
  form.append("latitude", String(payload.latitude));
  form.append("longitude", String(payload.longitude));
  form.append("submittedById", payload.submittedById);
  if (payload.description) form.append("description", payload.description);
  if (payload.totalCapacity !== undefined) form.append("totalCapacity", String(payload.totalCapacity));
  if (payload.pricePerHour !== undefined) form.append("pricePerHour", String(payload.pricePerHour));
  if (payload.openingTime) form.append("openingTime", payload.openingTime);
  if (payload.closingTime) form.append("closingTime", payload.closingTime);
  for (const file of payload.images) {
    form.append("images", file);
  }

  const { data } = await api.post<ApiSuccess<ParkingSpot>>("/parking", form);
  return data.data;
}

export function useCreateParkingSpot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createParkingSpotRequest,
    onSuccess: () => {
      // So the new spot shows up on Home/Map immediately without a manual refresh.
      queryClient.invalidateQueries({ queryKey: ["parking-spots"] });
    },
  });
}
