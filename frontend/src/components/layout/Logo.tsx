import { SquareParking } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <SquareParking className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Park<span className="text-primary">Ease</span>
        </span>
      )}
    </div>
  );
}
