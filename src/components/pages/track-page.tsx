"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ConsumptionEntry, InventoryItem } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  GlassWater,
  ShoppingBasket,
  Clock,
  Euro,
  Minus,
  Droplets,
} from "lucide-react";
import { format } from "date-fns";

export default function TrackPage() {
  const {
    products,
    locations,
    inventory,
    consumption,
    addConsumption,
    addInventoryItem,
    updateInventoryItem,
    removeInventoryItem,
  } = useStore();

  const [consumeDialogOpen, setConsumeDialogOpen] = useState(false);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);

  const [consumeForm, setConsumeForm] = useState({
    productId: "",
    locationId: "",
  });

  const [buyForm, setBuyForm] = useState({
    productId: "",
    locationId: "",
    price: "",
    quantity: "1",
  });

  const handleConsume = () => {
    if (!consumeForm.productId) return;

    // Find from inventory or use default price
    const invItem = inventory.find(
      (i) =>
        i.productId === consumeForm.productId &&
        (consumeForm.locationId ? i.locationId === consumeForm.locationId : true) &&
        i.quantity > 0
    );

    const entry: ConsumptionEntry = {
      id: `cons-${Date.now()}`,
      productId: consumeForm.productId,
      locationId: consumeForm.locationId || invItem?.locationId || locations[0]?.id || "",
      price: invItem?.buyPrice || 1.0,
      date: new Date().toISOString(),
      quantity: 1,
    };
    addConsumption(entry);

    // Decrease inventory
    if (invItem && invItem.quantity > 1) {
      updateInventoryItem(invItem.id, { quantity: invItem.quantity - 1 });
    } else if (invItem) {
      removeInventoryItem(invItem.id);
    }

    setConsumeDialogOpen(false);
    setConsumeForm({ productId: "", locationId: "" });
  };

  const handleBuy = () => {
    if (!buyForm.productId || !buyForm.locationId) return;
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      productId: buyForm.productId,
      locationId: buyForm.locationId,
      buyPrice: parseFloat(buyForm.price) || 0,
      quantity: parseInt(buyForm.quantity) || 1,
      dateAdded: new Date().toISOString(),
    };
    addInventoryItem(newItem);
    setBuyDialogOpen(false);
    setBuyForm({ productId: "", locationId: "", price: "", quantity: "1" });
  };

  // Recent consumption sorted by date
  const recentConsumption = [...consumption]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);

  // Recent inventory
  const recentInventory = [...inventory]
    .sort(
      (a, b) =>
        new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    )
    .slice(0, 30);

  const todayCount = consumption.filter(
    (c) =>
      new Date(c.date).toDateString() === new Date().toDateString()
  ).length;

  const todaySpent = consumption
    .filter(
      (c) => new Date(c.date).toDateString() === new Date().toDateString()
    )
    .reduce((s, c) => s + c.price * c.quantity, 0);

  const totalStock = inventory.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Track</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log consumption & purchases
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={consumeDialogOpen} onOpenChange={setConsumeDialogOpen}>
            <DialogTrigger render={<Button size="sm" variant="outline" className="gap-2" />}>
              <GlassWater className="h-4 w-4" />
              Consume
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Consumption</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>What did you drink?</Label>
                  <Select
                    value={consumeForm.productId}
                    onValueChange={(v) =>
                      setConsumeForm((f) => ({ ...f, productId: v ?? "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a drink..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            {p.imageUrl && (
                              <img
                                src={p.imageUrl}
                                alt=""
                                className="h-5 w-5 object-contain inline-block"                                referrerPolicy="no-referrer"                              />
                            )}
                            {p.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>From where? (optional)</Label>
                  <Select
                    value={consumeForm.locationId}
                    onValueChange={(v) =>
                      setConsumeForm((f) => ({ ...f, locationId: v ?? "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-detect from inventory" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleConsume} className="w-full mt-2">
                  <GlassWater className="h-4 w-4 mr-2" />
                  Log Drink
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
            <DialogTrigger render={<Button size="sm" className="gap-2" />}>
              <ShoppingBasket className="h-4 w-4" />
              Buy
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Log Purchase</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Drink</Label>
                  <Select
                    value={buyForm.productId}
                    onValueChange={(v) =>
                      setBuyForm((f) => ({ ...f, productId: v ?? "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a drink..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-2">
                            {p.imageUrl && (
                              <img
                                src={p.imageUrl}
                                alt=""
                                className="h-5 w-5 object-contain inline-block"
                                referrerPolicy="no-referrer"
                              />
                            )}
                            {p.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Select
                    value={buyForm.locationId}
                    onValueChange={(v) =>
                      setBuyForm((f) => ({ ...f, locationId: v ?? "" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Where did you buy?" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Price (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1.29"
                      value={buyForm.price}
                      onChange={(e) =>
                        setBuyForm((f) => ({ ...f, price: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={buyForm.quantity}
                      onChange={(e) =>
                        setBuyForm((f) => ({ ...f, quantity: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleBuy} className="w-full mt-2">
                  <ShoppingBasket className="h-4 w-4 mr-2" />
                  Add to Inventory
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <GlassWater className="h-5 w-5 mx-auto mb-1 text-blue-400" />
            <p className="text-2xl font-bold">{todayCount}</p>
            <p className="text-[10px] text-muted-foreground">Today&apos;s Drinks</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <Euro className="h-5 w-5 mx-auto mb-1 text-green-400" />
            <p className="text-2xl font-bold">€{todaySpent.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">Today&apos;s Cost</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <ShoppingBasket className="h-5 w-5 mx-auto mb-1 text-purple-400" />
            <p className="text-2xl font-bold">{totalStock}</p>
            <p className="text-[10px] text-muted-foreground">Total Stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Tabs defaultValue="consumed" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="consumed" className="flex-1">
            Consumed
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex-1">
            Inventory
          </TabsTrigger>
        </TabsList>
        <TabsContent value="consumed">
          <div>
            <div className="space-y-2 pt-2">
              {recentConsumption.map((entry) => {
                const product = products.find(
                  (p) => p.id === entry.productId
                );
                const location = locations.find(
                  (l) => l.id === entry.locationId
                );
                if (!product) return null;
                return (
                  <Card
                    key={entry.id}
                    className="border-border/30 bg-card/30"
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-8 w-8 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Droplets className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(entry.date), "MMM d, HH:mm")}
                          {location && (
                            <>
                              <span className="mx-1">·</span>
                              {location.name}
                            </>
                          )}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs shrink-0"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[product.category] + "20",
                          color: CATEGORY_COLORS[product.category],
                        }}
                      >
                        €{entry.price.toFixed(2)}
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
              {recentConsumption.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <GlassWater className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No consumption logged yet</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="inventory">
          <div>
            <div className="space-y-2 pt-2">
              {recentInventory.map((item) => {
                const product = products.find(
                  (p) => p.id === item.productId
                );
                const location = locations.find(
                  (l) => l.id === item.locationId
                );
                if (!product) return null;
                return (
                  <Card
                    key={item.id}
                    className="border-border/30 bg-card/30"
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-8 w-8 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Droplets className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {location?.name || "Unknown"} · €
                          {item.buyPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateInventoryItem(item.id, {
                                quantity: item.quantity - 1,
                              });
                            } else {
                              removeInventoryItem(item.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-muted hover:scale-110 active:scale-90 transition-all duration-150"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold min-w-[24px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateInventoryItem(item.id, {
                              quantity: item.quantity + 1,
                            })
                          }
                          className="p-1 rounded hover:bg-muted hover:scale-110 active:scale-90 transition-all duration-150"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {recentInventory.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingBasket className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No items in inventory</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
