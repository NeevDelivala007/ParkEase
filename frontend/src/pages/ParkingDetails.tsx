import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, ImageOff, MapPin, Navigation, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { ParkingTypeBadge, VerificationBadge, formatPrice, formatAvailability } from "@/components/parking/ParkingBadges";
import { VerifyReportActions } from "@/components/parking/VerifyReportActions";
import { PrebookButton, canPrebook } from "@/components/parking/PrebookButton";
import { useParkingSpot } from "@/hooks/useParkingSpots";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceInMeters, formatDistance, googleMapsDirectionsUrl } from "@/lib/geo";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { paths } from "@/routes/paths";

/** Mirrors the backend's COMMUNITY_VERIFICATION_THRESHOLD (backend/src/config/constants.ts). */
const COMMUNITY_VERIFICATION_THRESHOLD = 3;

function formatTime(value: string | null): string {
  if (!value) return "24 hours";
  return value;
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "Unknown";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function ParkingDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: spot, isLoading, isError, error } = useParkingSpot(id);
  const { location } = useGeolocation();

  if (isLoading) return <PageSpinner label="Loading parking details..." />;

  if (isError || !spot) {
    return (
      <EmptyState
        title="Couldn't load this parking spot"
        description={getApiErrorMessage(error, "It may not exist, or the backend may not be running.")}
        action={
          <Button asChild variant="outline">
            <Link to={paths.map}>
              <ArrowLeft className="h-4 w-4" />
              Back to map
            </Link>
          </Button>
        }
      />
    );
  }

  const distance = distanceInMeters(location, spot);
  const coverImage = spot.images[0];

  return (
    <div>
      <div className="mb-4">
        <Link to={paths.map} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to map
        </Link>
      </div>

      <PageHeader title={spot.name} description={spot.address ?? undefined} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            {coverImage ? (
              <img src={coverImage.imageUrl} alt={spot.name} className="h-56 w-full object-cover sm:h-72" />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-secondary text-muted-foreground">
                <ImageOff className="h-8 w-8" />
              </div>
            )}

            <CardContent className="pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <ParkingTypeBadge type={spot.type} />
                <VerificationBadge status={spot.verificationStatus} />
              </div>

              {spot.description && <p className="mt-3 text-sm text-muted-foreground">{spot.description}</p>}

              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Price</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{formatPrice(spot.pricePerHour)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Availability</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{formatAvailability(spot)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Distance</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{formatDistance(distance)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> Open
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {formatTime(spot.openingTime)} – {formatTime(spot.closingTime)}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3" /> Last updated
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">{formatRelativeTime(spot.lastUpdated)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> Coordinates
                  </dt>
                  <dd className="mt-0.5 font-medium text-foreground">
                    {spot.latitude.toFixed(5)}, {spot.longitude.toFixed(5)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardContent className="space-y-2 pt-5">
              {canPrebook(spot) ? (
                <PrebookButton spot={spot} size="lg" className="w-full" />
              ) : (
                <div className="rounded-lg bg-secondary px-3 py-2 text-center text-sm font-medium text-muted-foreground">
                  {spot.status !== "ACTIVE" ? "Not currently active" : "Currently Full"}
                </div>
              )}

              <Button asChild size="lg" variant={canPrebook(spot) ? "outline" : "default"} className="w-full">
                <a href={googleMapsDirectionsUrl(spot)} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4" />
                  Navigate
                </a>
              </Button>
              <p className="text-center text-xs text-muted-foreground">Opens directions in Google Maps</p>
            </CardContent>
          </Card>

          {spot.type === "COMMUNITY" && (
            <Card
              className={cn(
                "border-2",
                spot.verificationStatus === "COMMUNITY_VERIFIED"
                  ? "border-success/40 bg-success/5"
                  : spot.verificationStatus === "REJECTED"
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-warning/40 bg-warning/5"
              )}
            >
              <CardContent className="pt-5">
                <p className="text-base font-semibold text-foreground">
                  {spot.verificationStatus === "COMMUNITY_VERIFIED" && `🟢 Community Verified`}
                  {spot.verificationStatus === "COMMUNITY_SUBMITTED" && `🟡 Community Submitted`}
                  {spot.verificationStatus === "REJECTED" && `🔴 Rejected`}
                  {spot.verificationStatus === "UNDER_REVIEW" && `⚪ Under review`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {spot.verificationStatus === "COMMUNITY_VERIFIED"
                    ? `Verified by ${spot.verifyCount} driver${spot.verifyCount === 1 ? "" : "s"}`
                    : spot.verificationStatus === "COMMUNITY_SUBMITTED"
                      ? `${spot.verifyCount}/${COMMUNITY_VERIFICATION_THRESHOLD} verifications needed`
                      : spot.verificationStatus === "REJECTED"
                        ? "Reported and found unsuitable"
                        : "Not yet reviewed"}
                  {spot.reportCount > 0 && ` · ${spot.reportCount} report${spot.reportCount === 1 ? "" : "s"}`}
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  Community submissions aren't shown as authorized until verified.
                </p>

                <div className="mt-4 border-t border-border pt-4">
                  <VerifyReportActions spot={spot} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
