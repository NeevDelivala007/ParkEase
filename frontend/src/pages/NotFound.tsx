import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paths } from "@/routes/paths";

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Compass className="h-8 w-8" />
      </span>
      <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">404</h1>
      <p className="mt-1 text-lg font-medium text-foreground">Looks like this spot doesn't exist</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        The page you're looking for isn't here. Let's get you back to somewhere you can find parking.
      </p>
      <Button asChild className="mt-6">
        <Link to={paths.home}>
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
