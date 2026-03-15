"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { DrinkProduct } from "@/lib/types";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/data";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Package,
  Droplets,
  Pencil,
  Trash2,
} from "lucide-react";

export default function CatalogPage() {
  const { products, addProduct, updateProduct, removeProduct, inventory } =
    useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DrinkProduct | null>(null);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "soda" as DrinkProduct["category"],
    imageUrl: "",
    volume: 330,
    description: "",
  });

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const getStockCount = (productId: string) =>
    inventory
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.quantity, 0);

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingProduct) {
      updateProduct(editingProduct.id, { ...form });
    } else {
      const newProduct: DrinkProduct = {
        id: `prod-${Date.now()}`,
        ...form,
      };
      addProduct(newProduct);
    }
    resetForm();
    setDialogOpen(false);
  };

  const handleEdit = (product: DrinkProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      imageUrl: product.imageUrl,
      volume: product.volume,
      description: product.description || "",
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      brand: "",
      category: "soda",
      imageUrl: "",
      volume: 330,
      description: "",
    });
  };

  const categories = Object.entries(CATEGORY_LABELS);

  // Group filtered products by category, then sort by brand within each group
  const grouped = categories
    .map(([catKey, catLabel]) => {
      const products = filtered
        .filter((p) => p.category === catKey)
        .sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));
      return { key: catKey, label: catLabel, color: CATEGORY_COLORS[catKey], products };
    })
    .filter((g) => g.products.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drink Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {products.length} drinks in your collection
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
            Add Drink
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Drink" : "Add New Drink"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. Monster Energy"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Brand</Label>
                  <Input
                    placeholder="e.g. Monster"
                    value={form.brand}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, brand: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        category: (v ?? "soda") as DrinkProduct["category"],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Volume (ml)</Label>
                  <Input
                    type="number"
                    value={form.volume}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        volume: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Image URL</Label>
                  <Input
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, imageUrl: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Input
                  placeholder="Short description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <Button onClick={handleSave} className="w-full mt-2">
                {editingProduct ? "Save Changes" : "Add to Catalog"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search drinks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 ${
            categoryFilter === "all"
              ? "bg-foreground text-background border-foreground shadow-sm"
              : "bg-transparent text-muted-foreground border-border/60 hover:border-foreground/30 hover:text-foreground"
          }`}
          onClick={() => setCategoryFilter("all")}
        >
          All ({products.length})
        </button>
        {categories.map(([key, label]) => {
          const count = products.filter((p) => p.category === key).length;
          if (count === 0) return null;
          const color = CATEGORY_COLORS[key];
          const isActive = categoryFilter === key;
          return (
            <button
              key={key}
              className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                backgroundColor: isActive ? color : "transparent",
                color: isActive ? "#000" : color,
                borderColor: isActive ? color : `${color}44`,
                boxShadow: isActive ? `0 2px 8px ${color}40` : "none",
              }}
              onClick={() => setCategoryFilter(key)}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grouped Grid */}
      <div className="space-y-8">
        {grouped.map((group) => (
          <section key={group.key}>
            {/* Section header — only show when not filtering a single category */}
            {(categoryFilter === "all" || grouped.length > 1) && (
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="h-5 w-1 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: group.color }}>
                  {group.label}
                </h2>
                <span className="text-[11px] text-muted-foreground/40 font-medium">
                  {group.products.length}
                </span>
                <div className="flex-1 h-px bg-border/20" />
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
              {group.products.map((product) => {
            const stock = getStockCount(product.id);
            const catColor = CATEGORY_COLORS[product.category];
            return (
              <Card
                key={product.id}
                className="group relative overflow-hidden border-border/30 bg-card/80 backdrop-blur-sm hover:border-border/60 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 flex flex-col"
              >
                {/* Hover actions */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background hover:scale-110 active:scale-95 transition-all duration-200 hover:shadow-md"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground hover:scale-110 active:scale-95 transition-all duration-200 hover:shadow-md"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                {/* Product showcase area */}
                <div className="relative aspect-square flex items-center justify-center overflow-hidden">
                  {/* Dark base */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

                  {/* Radial spotlight from above */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[70%] rounded-full opacity-[0.07] blur-2xl bg-white" />

                  {/* Category-colored ambient glow behind product */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full blur-3xl opacity-20 group-hover:opacity-35 transition-opacity duration-700"
                    style={{ backgroundColor: catColor }}
                  />

                  {/* Bottom surface gradient — the "floor" */}
                  <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-card via-card/80 to-transparent" />

                  {/* Reflection surface line */}
                  <div className="absolute bottom-[32%] inset-x-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                  {/* Bottom colored glow on the surface */}
                  <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-4 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                    style={{ backgroundColor: catColor }}
                  />

                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="relative z-10 h-[80%] w-[80%] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)] group-hover:drop-shadow-[0_12px_32px_rgba(0,0,0,0.7)] group-hover:scale-[1.06] transition-all duration-700 ease-out"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <Droplets className="h-10 w-10 text-muted-foreground/15" />
                    </div>
                  )}

                  {/* Vignette overlay */}
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)] pointer-events-none" />
                </div>

                {/* Info area */}
                <CardContent className="p-3.5 pt-3 space-y-2 flex-1 flex flex-col">
                  {/* Tag */}
                  <div>
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: `${catColor}18`,
                        color: catColor,
                        border: `1px solid ${catColor}30`,
                      }}
                    >
                      {CATEGORY_LABELS[product.category]}
                    </span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-[13px] leading-tight truncate tracking-tight">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground/50 font-medium mt-0.5 tracking-wide">
                      {product.volume}ml
                    </p>
                    {product.description && (
                      <p className="text-[10px] text-muted-foreground/40 mt-1.5 line-clamp-1 italic">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/20">
                    <Package className="h-3 w-3 text-muted-foreground/40" />
                    <span className="text-[11px] font-semibold tracking-wide">
                      {stock > 0 ? (
                        <span className="text-green-400">{stock}</span>
                      ) : (
                        <span className="text-muted-foreground/30">0</span>
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
            </div>
          </section>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Droplets className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-sm">No drinks found</p>
          <p className="text-xs mt-1">Try a different search or filter</p>
        </div>
      )}
    </div>
  );
}
