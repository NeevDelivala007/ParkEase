import { NavLink } from "react-router-dom";
import { navItems } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5", isActive && "fill-primary/15")} />
                {item.label === "Add Parking" ? "Add" : item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
