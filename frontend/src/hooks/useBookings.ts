import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Booking } from "@/types/parking";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

async function fetchBookings(userId: string): Promise<Booking[]> {
  const { data } = await api.get<ApiSuccess<Booking[]>>("/bookings", { params: { userId } });
  return data.data;
}

/** Scoped to the current Demo User — there's no session, so userId is passed explicitly as a query param. */
export function useBookings(userId: string | undefined) {
  return useQuery({
    queryKey: ["bookings", userId],
    queryFn: () => fetchBookings(userId as string),
    enabled: Boolean(userId),
  });
}

interface CreateBookingPayload {
  parkingSpotId: string;
  userId: string;
  startTime: string;
  endTime: string;
}

async function createBookingRequest(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await api.post<ApiSuccess<Booking>>(`/parking/${payload.parkingSpotId}/book`, {
    userId: payload.userId,
    startTime: payload.startTime,
    endTime: payload.endTime,
  });
  return data.data;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookingRequest,
    onSuccess: (booking) => {
      // Availability just changed on the spot, and a new booking now exists.
      queryClient.invalidateQueries({ queryKey: ["parking-spots"] });
      queryClient.invalidateQueries({ queryKey: ["parking-spot", booking.parkingSpotId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

async function cancelBookingRequest(bookingId: string): Promise<Booking> {
  const { data } = await api.put<ApiSuccess<Booking>>(`/bookings/${bookingId}/cancel`);
  return data.data;
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelBookingRequest,
    onSuccess: (booking) => {
      // Cancellation restores capacity on the backend, so the spot's data is stale too.
      queryClient.invalidateQueries({ queryKey: ["parking-spots"] });
      queryClient.invalidateQueries({ queryKey: ["parking-spot", booking.parkingSpotId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
