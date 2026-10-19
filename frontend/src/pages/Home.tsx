import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, MapPin, LocateFixed, Compass, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { ParkingCard } from "@/components/parking/ParkingCard";
import { ParkingFilters, type ParkingFilter } from "@/components/parking/ParkingFilters";
import { useParkingSpots } from "@/hooks/useParkingSpots";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useFilteredParking } from "@/hooks/useFilteredParking";
import { getApiErrorMessage } from "@/lib/api";
import { paths } from "@/routes/paths";

const NEARBY_PREVIEW_COUNT = 6;

export function Home() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ParkingFilter>("ALL");

  const { data: spots, isLoading, isError, error } = useParkingSpots();
  const { location, status: geoStatus } = useGeolocation();
  const nearby = useFilteredParking(spots, location, search, filter);
  const preview = nearby.slice(0, NEARBY_PREVIEW_COUNT);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card px-6 py-8 text-center shadow-card sm:px-10 sm:py-12">
        <Badge variant="outline" className="mx-auto mb-4 w-fit gap-1.5 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          Public, private &amp; community parking — in one place
        </Badge>

        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
          Find parking. <span className="text-primary">Discover parking.</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
          ParkEase helps drivers discover legal, permitted and previously overlooked parking
          capacity near their destination — reducing unnecessary searching and circulation.
        </p>

        <div className="mx-auto mt-8 max-w-xl">
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-2 shadow-card sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by parking name or address..."
                className="h-11 border-none pl-9 shadow-none focus-visible:ring-0"
              />
            </div>
            <Button asChild size="lg" className="h-11 shrink-0">
              <Link to={paths.map}>
                <Search className="h-4 w-4" />
                Open map
              </Link>
            </Button>
          </div>

          <Button asChild variant="accent" className="mt-3 w-full sm:w-auto">
            <Link to={paths.addParking}>
              <Plus className="h-4 w-4" />
              Add Parking
            </Link>
          </Button>
        </div>
      </section>

      {/* Parking Near You */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">Parking Near You</h2>
          <Link to={paths.map} className="text-sm font-medium text-primary hover:underline">
            View on map
          </Link>
        </div>

        <div className="mb-4">
          <ParkingFilters value={filter} onChange={setFilter} />
        </div>

        {geoStatus === "denied" || geoStatus === "unsupported" || geoStatus === "error" ? (
          <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Compass className="h-3.5 w-3.5" />
            Showing distances from central Chennai — enable location access for distances from where you are.
          </p>
        ) : geoStatus === "success" ? (
          <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <LocateFixed className="h-3.5 w-3.5 text-primary" />
            Showing distances from your current location.
          </p>
        ) : null}

        {isLoading && <PageSpinner label="Loading nearby parking..." />}

        {isError && (
          <EmptyState
            title="Couldn't load parking"
            description={getApiErrorMessage(error, "The backend may not be running yet.")}
          />
        )}

        {!isLoading && !isError && preview.length === 0 && (
          <EmptyState
            title="No parking spots match"
            description="Try a different search term or filter."
          />
        )}

        {!isLoading && !isError && preview.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((spot) => (
              <ParkingCard key={spot.id} spot={spot} distanceMeters={spot.distanceMeters} />
            ))}
          </div>
        )}

        {nearby.length > NEARBY_PREVIEW_COUNT && (
          <div className="mt-4 text-center">
            <Button asChild variant="outline">
              <Link to={paths.map}>See all {nearby.length} results on the map</Link>
            </Button>
          </div>
        )}
      </section>

      {/* USP teaser */}
      <section className="rounded-2xl border border-border bg-secondary/50 p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">Know a spot others don't?</p>
            <h3 className="mt-1 text-lg font-bold text-foreground">Help other drivers discover it</h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Submit a legal, permitted parking spot you've found — one that doesn't obstruct
              traffic. It starts as{" "}
              <span className="font-medium text-warning-foreground">Community Submitted</span> and
              becomes <span className="font-medium text-success">Community Verified</span> once other
              drivers confirm it.
            </p>
          </div>
          <Button asChild variant="accent" size="lg" className="shrink-0">
            <Link to={paths.addParking}>
              Add a parking spot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
