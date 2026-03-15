"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import CatalogPage from "@/components/pages/catalog-page";
import LocationsPage from "@/components/pages/locations-page";
import TrackPage from "@/components/pages/track-page";
import AnalyticsPage from "@/components/pages/analytics-page";
import {
  LayoutGrid,
  MapPin,
  GlassWater,
  BarChart3,
  Droplets,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "catalog", label: "Catalog", icon: LayoutGrid },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "track", label: "Track", icon: GlassWater },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
] as const;

type PageId = (typeof NAV_ITEMS)[number]["id"];

export default function AppShell() {
  const [activePage, setActivePage] = useState<PageId>("catalog");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="w-full px-6 lg:px-10 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Droplets className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-none">
                SipTrack
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Drink Inventory
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full px-6 lg:px-10 py-5 pb-24">
        {activePage === "catalog" && <CatalogPage />}
        {activePage === "locations" && <LocationsPage />}
        {activePage === "track" && <TrackPage />}
        {activePage === "analytics" && <AnalyticsPage />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-t border-border/50">
        <div className="w-full max-w-lg mx-auto px-4">
          <div className="flex items-center justify-around h-16">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300 min-w-[64px] hover:scale-105 active:scale-95",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-lg transition-all duration-300",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive && "scale-110"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-all duration-300",
                      isActive && "font-semibold"
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute bottom-1 h-1 w-6 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
