import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * Application shell: consistent background, top navbar (desktop), bottom
 * nav (mobile), and a content area with responsive spacing. Every route
 * renders inside this via <Outlet />.
 */
export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="container flex-1 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
