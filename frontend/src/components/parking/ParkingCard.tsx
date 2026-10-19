import { Link } from "react-router-dom";
import { Navigation, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ParkingTypeBadge, VerificationBadge, formatPrice, formatAvailability } from "@/components/parking/ParkingBadges";
import { PrebookButton, canPrebook } from "@/components/parking/PrebookButton";
import { formatDistance, googleMapsDirectionsUrl } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { paths } from "@/routes/paths";
import type { ParkingSpot } from "@/types/parking";

interface ParkingCardProps {
  spot: ParkingSpot;
  distanceMeters?: number;
  isActive?: boolean;
  onSelect?: (spot: ParkingSpot) => void;
  className?: string;
}

export function ParkingCard({ spot, distanceMeters, isActive, onSelect, className }: ParkingCardProps) {
  const isFull = spot.availableCapacity === 0;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-elevated",
        isActive && "ring-2 ring-primary",
        className
      )}
      onClick={() => onSelect?.(spot)}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{spot.name}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <ParkingTypeBadge type={spot.type} />
              <VerificationBadge status={spot.verificationStatus} />
            </div>
          </div>
          {distanceMeters !== undefined && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {formatDistance(distanceMeters)}
            </span>
          )}
        </div>

        {spot.address && (
          <p className="mt-2 flex items-center gap-1 truncate text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {spot.address}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-foreground">{formatPrice(spot.pricePerHour)}</span>
            <span className={cn("text-xs", isFull ? "text-destructive" : "text-muted-foreground")}>
              {formatAvailability(spot)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to={paths.parkingDetails(spot.id)} onClick={(e) => e.stopPropagation()}>
              Details
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant={canPrebook(spot) ? "outline" : "default"}
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <a href={googleMapsDirectionsUrl(spot)} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-3.5 w-3.5" />
              Navigate
            </a>
          </Button>
        </div>
        {canPrebook(spot) && <PrebookButton spot={spot} className="mt-2 w-full" />}
      </CardContent>
    </Card>
  );
}
