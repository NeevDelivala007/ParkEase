import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, Navigation } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useIdentity } from "@/hooks/useIdentity";
import { useCreateBooking } from "@/hooks/useBookings";
import { getApiErrorMessage } from "@/lib/api";
import { googleMapsDirectionsUrl } from "@/lib/geo";
import {
  todayDateInputValue,
  nowRoundedTimeInputValue,
  addHoursToTimeValue,
  combineDateAndTime,
  hoursBetween,
  formatDateLabel,
  formatTimeLabel,
  formatDuration,
  formatIsoDate,
  formatIsoTime,
} from "@/lib/datetime";
import { paths } from "@/routes/paths";
import type { ParkingSpot } from "@/types/parking";

interface PrebookButtonProps {
  spot: ParkingSpot;
  size?: ButtonProps["size"];
  className?: string;
}

/** True whenever a booking could actually succeed — used by callers to decide whether to render this at all. */
export function canPrebook(spot: Pick<ParkingSpot, "status" | "availableCapacity">): boolean {
  return spot.status === "ACTIVE" && spot.availableCapacity !== null && spot.availableCapacity > 0;
}

export function PrebookButton({ spot, size = "sm", className }: PrebookButtonProps) {
  const { activeUser } = useIdentity();
  const createBooking = useCreateBooking();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayDateInputValue());
  const [startTime, setStartTime] = useState(nowRoundedTimeInputValue());
  const [endTime, setEndTime] = useState(addHoursToTimeValue(nowRoundedTimeInputValue(), 1));
  const [formError, setFormError] = useState<string | undefined>();

  if (!canPrebook(spot)) return null;

  const startDate = combineDateAndTime(date, startTime);
  const endDate = combineDateAndTime(date, endTime);
  const durationHours = hoursBetween(startDate, endDate);
  const pricePerHourValue = spot.pricePerHour ? Number(spot.pricePerHour) : 0;
  const estimatedAmount = pricePerHourValue * Math.max(durationHours, 0);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Give the close animation a moment before resetting to the form view.
      setTimeout(() => createBooking.reset(), 200);
    }
  }

  function handleConfirm() {
    if (!activeUser) return;
    if (durationHours <= 0) {
      setFormError("End time must be after start time.");
      return;
    }
    if (startDate.getTime() < Date.now()) {
      setFormError("Start time can't be in the past.");
      return;
    }
    setFormError(undefined);
    createBooking.mutate({
      parkingSpotId: spot.id,
      userId: activeUser.id,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    });
  }

  return (
    <>
      <Button
        size={size}
        variant="accent"
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        <CalendarClock className="h-3.5 w-3.5" />
        Prebook
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          {createBooking.isSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  Parking Reserved
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parking</span>
                  <span className="font-medium text-foreground">{spot.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium text-foreground">{formatIsoDate(createBooking.data.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time</span>
                  <span className="font-medium text-foreground">
                    {formatIsoTime(createBooking.data.startTime)} – {formatIsoTime(createBooking.data.endTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium text-foreground">
                    {Number(createBooking.data.amount) === 0 ? "Free" : `₹${Number(createBooking.data.amount).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-mono text-xs text-foreground">{createBooking.data.id}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <a href={googleMapsDirectionsUrl(spot)} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-4 w-4" />
                    Navigate
                  </a>
                </Button>
                <Button asChild className="flex-1" onClick={() => handleOpenChange(false)}>
                  <Link to={paths.bookings}>View My Bookings</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Prebook parking</DialogTitle>
                <DialogDescription>{spot.name}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={date}
                    min={todayDateInputValue()}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Start time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">End time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 rounded-lg bg-secondary/60 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{formatDuration(Math.max(durationHours, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated price</span>
                    <span className="font-medium text-foreground">
                      {pricePerHourValue === 0 ? "Free" : `₹${estimatedAmount.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available spaces</span>
                    <span className="font-medium text-foreground">{spot.availableCapacity}</span>
                  </div>
                </div>

                {(formError || createBooking.isError) && (
                  <p className="text-xs text-destructive">
                    {formError ?? getApiErrorMessage(createBooking.error, "Couldn't complete this booking.")}
                  </p>
                )}

                <Button className="w-full" onClick={handleConfirm} isLoading={createBooking.isPending} disabled={!activeUser}>
                  Confirm Booking
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  {formatDateLabel(date)} · {formatTimeLabel(startTime)} – {formatTimeLabel(endTime)}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
