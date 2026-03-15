export interface DrinkProduct {
  id: string;
  name: string;
  brand: string;
  category: "energy" | "soda" | "juice" | "water" | "beer" | "cider" | "other";
  imageUrl: string;
  volume: number; // in ml
  description?: string;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  color: string;
  icon: string; // lucide icon name
}

export interface InventoryItem {
  id: string;
  productId: string;
  locationId: string;
  buyPrice: number;
  quantity: number;
  dateAdded: string; // ISO
}

export interface ConsumptionEntry {
  id: string;
  productId: string;
  locationId: string;
  price: number;
  date: string; // ISO
  quantity: number;
}
