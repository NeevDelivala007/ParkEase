import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LocateFixed,
  MapPinPlus,
  ShieldAlert,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LocationPicker } from "@/components/parking/LocationPicker";
import { ImageUploadField } from "@/components/parking/ImageUploadField";
import { useGeolocation, DEFAULT_LOCATION } from "@/hooks/useGeolocation";
import { useIdentity } from "@/hooks/useIdentity";
import { useCreateParkingSpot } from "@/hooks/useCreateParkingSpot";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { paths } from "@/routes/paths";
import type { LatLng } from "@/lib/geo";

const STEPS = ["Location", "Photos", "Details"] as const;

export function AddParking() {
  const geo = useGeolocation();
  const { activeUser } = useIdentity();
  const createSpot = useCreateParkingSpot();

  const [step, setStep] = useState(0);

  const [location, setLocation] = useState<LatLng>(DEFAULT_LOCATION);
  const [locationTouched, setLocationTouched] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagesError, setImagesError] = useState<string | undefined>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [pricePerHour, setPricePerHour] = useState("");
  const [totalCapacity, setTotalCapacity] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [safetyConfirmed, setSafetyConfirmed] = useState(false);
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({});

  // Follow the user's real location once it resolves, unless they've
  // already moved the pin themselves (click, drag, or the button below).
  useEffect(() => {
    if (!locationTouched && geo.status === "success") {
      setLocation(geo.location);
    }
  }, [geo.status, geo.location, locationTouched]);

  function handleUseCurrentLocation() {
    setLocation(geo.location);
    setLocationTouched(true);
  }

  function handleLocationChange(loc: LatLng) {
    setLocation(loc);
    setLocationTouched(true);
  }

  function goNext() {
    if (step === 1 && images.length === 0) {
      setImagesError("Add at least one photo so other drivers can recognize the spot.");
      return;
    }
    setImagesError(undefined);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function validateDetails(): boolean {
    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = "Give this spot a short name.";
    if (isPaid && (!pricePerHour || Number(pricePerHour) <= 0)) {
      errors.pricePerHour = "Enter a price per hour, or switch to Free.";
    }
    if (!safetyConfirmed) errors.safety = "Please confirm this location is suitable for parking.";
    setDetailsErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validateDetails() || !activeUser) return;

    createSpot.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      latitude: location.latitude,
      longitude: location.longitude,
      totalCapacity: totalCapacity ? Number(totalCapacity) : undefined,
      pricePerHour: isPaid && pricePerHour ? Number(pricePerHour) : undefined,
      openingTime: openingTime || undefined,
      closingTime: closingTime || undefined,
      submittedById: activeUser.id,
      images,
    });
  }

  // --- Success state -----------------------------------------------
  if (createSpot.isSuccess) {
    const spot = createSpot.data;
    return (
      <div className="mx-auto max-w-md">
        <Card className="border-success/40 bg-success/5">
          <CardContent className="flex flex-col items-center pt-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <h1 className="mt-4 text-xl font-bold text-foreground">Parking Spot Submitted</h1>
            <Badge variant="warning" className="mt-2">
              Community Submitted
            </Badge>

            {spot.images[0] && (
              <img
                src={spot.images[0].imageUrl}
                alt={spot.name}
                className="mt-4 h-40 w-full rounded-lg border border-border object-cover"
              />
            )}

            <p className="mt-4 text-base font-medium text-foreground">{spot.name}</p>
            <p className="text-xs text-muted-foreground">
              {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Other drivers can now verify it. Once it reaches enough confirmations, it becomes
              Community Verified for everyone.
            </p>

            <div className="mt-6 flex w-full gap-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to={paths.parkingDetails(spot.id)}>View Parking</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to={paths.map}>See on map</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Add Parking" description="Help other drivers discover parking capacity you've found." />

      <Card className="mb-5 border-warning/30 bg-warning/5">
        <CardContent className="flex items-start gap-3 pt-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
          <p className="text-sm text-muted-foreground">
            Only submit parking locations where parking is permitted and where vehicles do not
            obstruct traffic, pedestrians, emergency access or private property.
          </p>
        </CardContent>
      </Card>

      {/* Step indicator */}
      <div className="mb-5 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                index < step
                  ? "bg-success text-success-foreground"
                  : index === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
              )}
            >
              {index < step ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
            </div>
            <span className={cn("text-xs font-medium", index === step ? "text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {index < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Where is it?</p>
                <Button size="sm" variant="outline" onClick={handleUseCurrentLocation} disabled={geo.status === "loading"}>
                  <LocateFixed className="h-3.5 w-3.5" />
                  Use my current location
                </Button>
              </div>

              <LocationPicker value={location} onChange={handleLocationChange} className="h-64 overflow-hidden rounded-lg border border-border" />

              <p className="text-xs text-muted-foreground">
                Tap the map or drag the pin to adjust it precisely. Coordinates:{" "}
                <span className="font-medium text-foreground">
                  {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                </span>
              </p>

              {geo.status === "denied" && (
                <p className="text-xs text-muted-foreground">
                  Location access was denied — set the pin manually on the map above.
                </p>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Add photos</p>
              <p className="text-xs text-muted-foreground">
                A clear photo helps other drivers recognize the spot and helps verify it's usable.
              </p>
              <ImageUploadField files={images} onChange={setImages} error={imagesError} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Parking name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Shaded lane behind the market" />
                {detailsErrors.name && <p className="mt-1 text-xs text-destructive">{detailsErrors.name}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Anything drivers should know — landmarks, ground surface, etc."
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPaid(false)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                      !isPaid ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                    )}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPaid(true)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
                      isPaid ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"
                    )}
                  >
                    Paid
                  </button>
                </div>
                {isPaid && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={pricePerHour}
                      onChange={(e) => setPricePerHour(e.target.value)}
                      placeholder="Price per hour (Rs.)"
                    />
                    {detailsErrors.pricePerHour && <p className="mt-1 text-xs text-destructive">{detailsErrors.pricePerHour}</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Approximate capacity (optional)</label>
                <Input
                  type="number"
                  min={1}
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  placeholder="e.g. 4"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Opening time</label>
                  <Input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Closing time</label>
                  <Input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} />
                </div>
              </div>

              <label className="flex items-start gap-2.5 rounded-lg border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={safetyConfirmed}
                  onChange={(e) => setSafetyConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-input"
                />
                <span className="text-muted-foreground">
                  I confirm that this location is suitable for parking to the best of my knowledge.
                </span>
              </label>
              {detailsErrors.safety && <p className="text-xs text-destructive">{detailsErrors.safety}</p>}

              {createSpot.isError && (
                <p className="text-xs text-destructive">{getApiErrorMessage(createSpot.error, "Couldn't submit this spot.")}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={goBack} disabled={createSpot.isPending}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        )}
        <div className="flex-1" />
        {step < STEPS.length - 1 ? (
          <Button onClick={goNext}>
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={createSpot.isPending} disabled={!activeUser}>
            <MapPinPlus className="h-4 w-4" />
            Add Parking
          </Button>
        )}
      </div>
    </div>
  );
}
