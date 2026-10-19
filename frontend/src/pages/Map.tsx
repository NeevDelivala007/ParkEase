import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import { Search, LocateFixed, Compass, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { ParkingCard } from "@/components/parking/ParkingCard";
import { ParkingFilters, type ParkingFilter } from "@/components/parking/ParkingFilters";
import { ParkingTypeBadge, VerificationBadge, formatPrice, formatAvailability } from "@/components/parking/ParkingBadges";
import { useParkingSpots } from "@/hooks/useParkingSpots";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useFilteredParking, type ParkingSpotWithDistance } from "@/hooks/useFilteredParking";
import { createParkingIcon, createUserLocationIcon } from "@/lib/mapIcons";
import { formatDistance, googleMapsDirectionsUrl } from "@/lib/geo";
import { getApiErrorMessage } from "@/lib/api";
import { paths } from "@/routes/paths";
import type { ParkingSpot } from "@/types/parking";

/** Recenters the map whenever the selected spot (or the user's own location) changes. */
function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.6 });
  }, [center, zoom, map]);
  return null;
}

export function MapPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ParkingFilter>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: spots, isLoading, isError, error } = useParkingSpots();
  const { location, status: geoStatus } = useGeolocation();
  const results = useFilteredParking(spots, location, search, filter);

  const selectedSpot = useMemo(
    () => results.find((spot) => spot.id === selectedId) ?? null,
    [results, selectedId]
  );

  const center: [number, number] = selectedSpot
    ? [selectedSpot.latitude, selectedSpot.longitude]
    : [location.latitude, location.longitude];
  const zoom = selectedSpot ? 16 : 14;

  function handleSelect(spot: ParkingSpot) {
    setSelectedId(spot.id === selectedId ? null : spot.id);
  }

  return (
    <div>
      <PageHeader
        title="Parking Map"
        description="Discover public, private and community parking near your destination."
        action={
          <Button asChild size="sm">
            <Link to={paths.addParking}>
              <Plus className="h-4 w-4" />
              Add Parking
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or address..."
            className="pl-9"
          />
        </div>
        <ParkingFilters value={filter} onChange={setFilter} />
      </div>

      {geoStatus === "denied" || geoStatus === "unsupported" || geoStatus === "error" ? (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Compass className="h-3.5 w-3.5" />
          Centered on Chennai — enable location access to center the map on you.
        </p>
      ) : geoStatus === "success" ? (
        <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <LocateFixed className="h-3.5 w-3.5 text-primary" />
          Centered on your current location.
        </p>
      ) : null}

      {isError && (
        <EmptyState
          title="Couldn't load parking"
          description={getApiErrorMessage(error, "The backend may not be running yet.")}
        />
      )}

      {!isError && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Map */}
          <div className="h-[45vh] min-h-[320px] overflow-hidden rounded-xl border border-border shadow-card lg:order-2 lg:h-[70vh]">
            <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapRecenter center={center} zoom={zoom} />

              <Marker position={[location.latitude, location.longitude]} icon={createUserLocationIcon()}>
                <Popup>You are here (approximate)</Popup>
              </Marker>

              {results.map((spot) => (
                <Marker
                  key={spot.id}
                  position={[spot.latitude, spot.longitude]}
                  icon={createParkingIcon(spot, spot.id === selectedId)}
                  eventHandlers={{ click: () => handleSelect(spot) }}
                >
                  <Popup>
                    <div className="min-w-[180px] space-y-1.5">
                      <p className="font-medium text-foreground">{spot.name}</p>
                      <div className="flex flex-wrap gap-1">
                        <ParkingTypeBadge type={spot.type} />
                        <VerificationBadge status={spot.verificationStatus} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(spot.pricePerHour)} · {formatAvailability(spot)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDistance(spot.distanceMeters)} away</p>
                      <div className="flex gap-2 pt-1">
                        <Link to={paths.parkingDetails(spot.id)} className="text-xs font-medium text-primary hover:underline">
                          Details
                        </Link>
                        <a
                          href={googleMapsDirectionsUrl(spot)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Navigate
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* List */}
          <div className="lg:order-1 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
            {isLoading && <PageSpinner label="Loading parking spots..." />}

            {!isLoading && results.length === 0 && (
              <EmptyState title="No parking spots match" description="Try a different search term or filter." />
            )}

            {!isLoading && results.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">{results.length} parking spots</p>
                {results.map((spot) => (
                  <ParkingCard
                    key={spot.id}
                    spot={spot}
                    distanceMeters={spot.distanceMeters}
                    isActive={spot.id === selectedId}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
