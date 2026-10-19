import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ParkingSpot } from "@/types/parking";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

async function fetchParkingSpots(): Promise<ParkingSpot[]> {
  const { data } = await api.get<ApiSuccess<ParkingSpot[]>>("/parking");
  return data.data;
}

export function useParkingSpots() {
  return useQuery({
    queryKey: ["parking-spots"],
    queryFn: fetchParkingSpots,
  });
}

async function fetchParkingSpot(id: string): Promise<ParkingSpot> {
  const { data } = await api.get<ApiSuccess<ParkingSpot>>(`/parking/${id}`);
  return data.data;
}

export function useParkingSpot(id: string | undefined) {
  return useQuery({
    queryKey: ["parking-spot", id],
    queryFn: () => fetchParkingSpot(id as string),
    enabled: Boolean(id),
  });
}
