import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DrinkProduct,
  Location,
  InventoryItem,
  ConsumptionEntry,
} from "./types";
import { DEFAULT_PRODUCTS, DEFAULT_LOCATIONS } from "./data";

interface SipTrackState {
  products: DrinkProduct[];
  locations: Location[];
  inventory: InventoryItem[];
  consumption: ConsumptionEntry[];

  // Product actions
  addProduct: (product: DrinkProduct) => void;
  updateProduct: (id: string, updates: Partial<DrinkProduct>) => void;
  removeProduct: (id: string) => void;

  // Location actions
  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  removeLocation: (id: string) => void;

  // Inventory actions
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;

  // Consumption actions
  addConsumption: (entry: ConsumptionEntry) => void;
  removeConsumption: (id: string) => void;
}

// Seeded PRNG to produce deterministic data (avoids hydration mismatch)
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateSampleConsumption(): ConsumptionEntry[] {
  const rand = seededRandom(42);
  const entries: ConsumptionEntry[] = [];
  const productIds = DEFAULT_PRODUCTS.map((p) => p.id);
  const locationIds = DEFAULT_LOCATIONS.map((l) => l.id);
  const prices = [0.89, 0.99, 1.09, 1.19, 1.29, 1.49, 1.69, 1.99, 2.29, 2.49];

  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(rand() * 90);
    const d = new Date("2026-03-15T12:00:00Z");
    d.setDate(d.getDate() - daysAgo);
    entries.push({
      id: `sample-c-${i}`,
      productId: productIds[Math.floor(rand() * productIds.length)],
      locationId: locationIds[Math.floor(rand() * locationIds.length)],
      price: prices[Math.floor(rand() * prices.length)],
      date: d.toISOString(),
      quantity: 1,
    });
  }
  return entries;
}

function generateSampleInventory(): InventoryItem[] {
  const rand = seededRandom(123);
  const items: InventoryItem[] = [];
  const productIds = DEFAULT_PRODUCTS.map((p) => p.id);
  const locationIds = DEFAULT_LOCATIONS.map((l) => l.id);
  const prices = [0.79, 0.89, 0.99, 1.19, 1.29, 1.49, 1.99];

  for (let i = 0; i < 15; i++) {
    items.push({
      id: `sample-i-${i}`,
      productId: productIds[Math.floor(rand() * productIds.length)],
      locationId: locationIds[Math.floor(rand() * locationIds.length)],
      buyPrice: prices[Math.floor(rand() * prices.length)],
      quantity: Math.floor(rand() * 12) + 1,
      dateAdded: "2026-03-15T12:00:00.000Z",
    });
  }
  return items;
}

export const useStore = create<SipTrackState>()(
  persist(
    (set) => ({
      products: DEFAULT_PRODUCTS,
      locations: DEFAULT_LOCATIONS,
      inventory: generateSampleInventory(),
      consumption: generateSampleConsumption(),

      addProduct: (product) =>
        set((s) => ({ products: [...s.products, product] })),
      updateProduct: (id, updates) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removeProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addLocation: (location) =>
        set((s) => ({ locations: [...s.locations, location] })),
      updateLocation: (id, updates) =>
        set((s) => ({
          locations: s.locations.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),
      removeLocation: (id) =>
        set((s) => ({ locations: s.locations.filter((l) => l.id !== id) })),

      addInventoryItem: (item) =>
        set((s) => ({ inventory: [...s.inventory, item] })),
      updateInventoryItem: (id, updates) =>
        set((s) => ({
          inventory: s.inventory.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        })),
      removeInventoryItem: (id) =>
        set((s) => ({ inventory: s.inventory.filter((i) => i.id !== id) })),

      addConsumption: (entry) =>
        set((s) => ({ consumption: [...s.consumption, entry] })),
      removeConsumption: (id) =>
        set((s) => ({
          consumption: s.consumption.filter((c) => c.id !== id),
        })),
    }),
    { name: "siptrack-storage" }
  )
);
