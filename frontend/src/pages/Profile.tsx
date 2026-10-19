import { Link } from "react-router-dom";
import { MapPinPlus, Ticket, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IdentitySwitcher } from "@/components/layout/IdentitySwitcher";
import { useIdentity } from "@/hooks/useIdentity";
import { paths } from "@/routes/paths";

export function Profile() {
  const { activeUser, isLoading } = useIdentity();

  return (
    <div>
      <PageHeader title="Profile" />

      <Card className="mb-5">
        <CardContent className="flex items-center gap-4 pt-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <UserIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              {isLoading ? "Setting up your demo identity..." : activeUser?.name ?? "Guest"}
            </p>
            <p className="text-sm text-muted-foreground">
              ParkEase doesn't have real login yet — bookings, submissions and verifications are
              attributed to this Demo User instead.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mb-5">
        <IdentitySwitcher />
      </div>

      <Card>
        <CardContent className="divide-y divide-border pt-5">
          <Link to={paths.bookings} className="flex items-center gap-3 py-3 text-sm text-foreground">
            <Ticket className="h-4 w-4 text-muted-foreground" />
            My bookings
          </Link>
          <Link to={paths.addParking} className="flex items-center gap-3 py-3 text-sm text-foreground">
            <MapPinPlus className="h-4 w-4 text-muted-foreground" />
            Add a parking spot
          </Link>
        </CardContent>
      </Card>

      <div className="mt-4">
        <Button asChild variant="outline" className="w-full">
          <Link to={paths.map}>Browse the map</Link>
        </Button>
      </div>
    </div>
  );
}
