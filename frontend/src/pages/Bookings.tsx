import { Link } from "react-router-dom";
import { Navigation, Ticket, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { useIdentity } from "@/hooks/useIdentity";
import { useBookings, useCancelBooking } from "@/hooks/useBookings";
import { formatIsoDate, formatIsoTime, hoursBetween, formatDuration } from "@/lib/datetime";
import { googleMapsDirectionsUrl } from "@/lib/geo";
import { getApiErrorMessage } from "@/lib/api";
import { paths } from "@/routes/paths";
import type { Booking, BookingStatus } from "@/types/parking";

const statusVariants: Record<BookingStatus, "success" | "destructive" | "secondary"> = {
  CONFIRMED: "success",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
};

function BookingRow({ booking }: { booking: Booking }) {
  const cancelBooking = useCancelBooking();
  const duration = hoursBetween(new Date(booking.startTime), new Date(booking.endTime));

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{booking.parkingSpot.name}</p>
            {booking.parkingSpot.address && (
              <p className="truncate text-xs text-muted-foreground">{booking.parkingSpot.address}</p>
            )}
          </div>
          <Badge variant={statusVariants[booking.status]}>{booking.status}</Badge>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="font-medium text-foreground">{formatIsoDate(booking.startTime)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="font-medium text-foreground">
              {formatIsoTime(booking.startTime)} – {formatIsoTime(booking.endTime)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="font-medium text-foreground">{formatDuration(duration)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="font-medium text-foreground">
              {Number(booking.amount) === 0 ? "Free" : `₹${Number(booking.amount).toFixed(2)}`}
            </p>
          </div>
        </div>

        <p className="mt-2 font-mono text-[11px] text-muted-foreground">ID: {booking.id}</p>

        {cancelBooking.isError && (
          <p className="mt-2 text-xs text-destructive">
            {getApiErrorMessage(cancelBooking.error, "Couldn't cancel this booking.")}
          </p>
        )}

        {booking.status === "CONFIRMED" && (
          <div className="mt-3 flex gap-2">
            <Button asChild size="sm" variant="outline" className="flex-1">
              <a
                href={googleMapsDirectionsUrl(booking.parkingSpot)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="h-3.5 w-3.5" />
                Navigate
              </a>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-destructive hover:bg-destructive/10"
              onClick={() => cancelBooking.mutate(booking.id)}
              isLoading={cancelBooking.isPending}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BookingSection({ title, bookings }: { title: string; bookings: Booking[] }) {
  if (bookings.length === 0) return null;
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
        {title} ({bookings.length})
      </h2>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <BookingRow key={booking.id} booking={booking} />
        ))}
      </div>
    </div>
  );
}

export function Bookings() {
  const { activeUser, isLoading: identityLoading } = useIdentity();
  const { data: bookings, isLoading, isError, error } = useBookings(activeUser?.id);

  const confirmed = bookings?.filter((b) => b.status === "CONFIRMED") ?? [];
  const completed = bookings?.filter((b) => b.status === "COMPLETED") ?? [];
  const cancelled = bookings?.filter((b) => b.status === "CANCELLED") ?? [];

  return (
    <div>
      <PageHeader title="Bookings" description="Your upcoming and past parking bookings." />

      {(isLoading || identityLoading) && <PageSpinner label="Loading your bookings..." />}

      {isError && (
        <EmptyState
          title="Couldn't load bookings"
          description={getApiErrorMessage(error, "The backend may not be running yet.")}
        />
      )}

      {!isLoading && !identityLoading && !isError && bookings && bookings.length === 0 && (
        <EmptyState
          icon={<Ticket className="h-10 w-10" />}
          title="No bookings yet"
          description="Prebook a parking spot from the map or a parking's details page — it'll show up here."
          action={
            <Button asChild variant="outline">
              <Link to={paths.map}>Browse the map</Link>
            </Button>
          }
        />
      )}

      {!isLoading && !identityLoading && !isError && bookings && bookings.length > 0 && (
        <div className="space-y-6">
          <BookingSection title="Upcoming" bookings={confirmed} />
          <BookingSection title="Completed" bookings={completed} />
          <BookingSection title="Cancelled" bookings={cancelled} />
        </div>
      )}
    </div>
  );
}
