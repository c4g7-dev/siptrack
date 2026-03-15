"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Location } from "@/lib/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Refrigerator,
  Snowflake,
  Archive,
  Backpack,
  Monitor,
  Home,
  Package,
  ShoppingCart,
} from "lucide-react";

const ICON_OPTIONS = [
  { value: "Refrigerator", icon: Refrigerator, label: "Fridge" },
  { value: "Snowflake", icon: Snowflake, label: "Freezer" },
  { value: "Archive", icon: Archive, label: "Shelf" },
  { value: "Backpack", icon: Backpack, label: "Backpack" },
  { value: "Monitor", icon: Monitor, label: "Desk" },
  { value: "Home", icon: Home, label: "Home" },
  { value: "Package", icon: Package, label: "Package" },
  { value: "ShoppingCart", icon: ShoppingCart, label: "Cart" },
  { value: "MapPin", icon: MapPin, label: "Pin" },
];

const COLOR_OPTIONS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#6b7280",
];

function getIconComponent(iconName: string) {
  const found = ICON_OPTIONS.find((o) => o.value === iconName);
  return found ? found.icon : MapPin;
}

export default function LocationsPage() {
  const {
    locations,
    addLocation,
    updateLocation,
    removeLocation,
    inventory,
    consumption,
  } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    color: "#3b82f6",
    icon: "ShoppingCart",
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingLocation) {
      updateLocation(editingLocation.id, { ...form });
    } else {
      const newLocation: Location = {
        id: `loc-${Date.now()}`,
        ...form,
      };
      addLocation(newLocation);
    }
    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (loc: Location) => {
    setEditingLocation(loc);
    setForm({
      name: loc.name,
      address: loc.address || "",
      color: loc.color,
      icon: loc.icon,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingLocation(null);
    setForm({ name: "", address: "", color: "#3b82f6", icon: "ShoppingCart" });
  };

  const getLocationStats = (locId: string) => {
    const inv = inventory.filter((i) => i.locationId === locId);
    const cons = consumption.filter((c) => c.locationId === locId);
    const totalItems = inv.reduce((s, i) => s + i.quantity, 0);
    const totalSpent = cons.reduce((s, c) => s + c.price * c.quantity, 0);
    return { totalItems, totalPurchases: cons.length, totalSpent };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Locations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your purchase locations
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger render={<Button size="sm" className="gap-2" />}>
            <Plus className="h-4 w-4" />
            Add Location
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Edit Location" : "New Location"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. REWE Markt"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Address (optional)</Label>
                <Input
                  placeholder="e.g. Hauptstraße 12"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      className="h-8 w-8 rounded-full transition-all duration-200 ring-offset-background"
                      style={{
                        backgroundColor: color,
                        boxShadow:
                          form.color === color
                            ? `0 0 0 2px var(--background), 0 0 0 4px ${color}`
                            : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Icon</Label>
                <div className="flex gap-2 flex-wrap">
                  {ICON_OPTIONS.map((opt) => {
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setForm((f) => ({ ...f, icon: opt.value }))
                        }
                        className={`p-2.5 rounded-lg transition-all duration-200 ${
                          form.icon === opt.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        <IconComp className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full mt-2">
                {editingLocation ? "Save Changes" : "Add Location"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations.map((loc) => {
          const Icon = getIconComponent(loc.icon);
          const stats = getLocationStats(loc.id);
          return (
            <Card
              key={loc.id}
              className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2.5 rounded-xl"
                      style={{ backgroundColor: loc.color + "20" }}
                    >
                      <Icon
                        className="h-5 w-5"
                        style={{ color: loc.color }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{loc.name}</h3>
                      {loc.address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {loc.address}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleEdit(loc)}
                      className="p-1.5 rounded-md hover:bg-muted hover:scale-110 active:scale-90 transition-all duration-150"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => removeLocation(loc.id)}
                      className="p-1.5 rounded-md hover:bg-destructive hover:text-destructive-foreground hover:scale-110 active:scale-90 transition-all duration-150"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold" style={{ color: loc.color }}>
                      {stats.totalItems}
                    </p>
                    <p className="text-[10px] text-muted-foreground">In Stock</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold" style={{ color: loc.color }}>
                      {stats.totalPurchases}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Purchases</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold" style={{ color: loc.color }}>
                      €{stats.totalSpent.toFixed(0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {locations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <MapPin className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm">No locations yet</p>
          <p className="text-xs mt-1">Add your first purchase location</p>
        </div>
      )}
    </div>
  );
}
