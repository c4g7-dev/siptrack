"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  GlassWater,
  ShoppingBasket,
  Flame,
  Droplets,
  BarChart3,
} from "lucide-react";
import { format, subDays, startOfDay, isAfter } from "date-fns";

export default function AnalyticsPage() {
  const { products, locations, inventory, consumption } = useStore();

  const analytics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sevenDaysAgo = subDays(now, 7);

    // Total consumption
    const totalConsumed = consumption.length;
    const totalSpent = consumption.reduce(
      (s, c) => s + c.price * c.quantity,
      0
    );
    const avgPricePerDrink = totalConsumed > 0 ? totalSpent / totalConsumed : 0;

    // Last 30 days
    const last30 = consumption.filter((c) =>
      isAfter(new Date(c.date), thirtyDaysAgo)
    );
    const last30Spent = last30.reduce(
      (s, c) => s + c.price * c.quantity,
      0
    );
    const last30Count = last30.length;

    // Last 7 days
    const last7 = consumption.filter((c) =>
      isAfter(new Date(c.date), sevenDaysAgo)
    );
    const last7Count = last7.length;

    // Daily consumption for chart (last 30 days)
    const dailyData: { date: string; count: number; spent: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = startOfDay(subDays(now, i));
      const dayStr = format(day, "yyyy-MM-dd");
      const dayEntries = consumption.filter(
        (c) => format(new Date(c.date), "yyyy-MM-dd") === dayStr
      );
      dailyData.push({
        date: format(day, "MMM d"),
        count: dayEntries.length,
        spent: dayEntries.reduce((s, c) => s + c.price * c.quantity, 0),
      });
    }

    // By category
    const byCategory: Record<string, { count: number; spent: number }> = {};
    consumption.forEach((c) => {
      const product = products.find((p) => p.id === c.productId);
      if (!product) return;
      if (!byCategory[product.category]) {
        byCategory[product.category] = { count: 0, spent: 0 };
      }
      byCategory[product.category].count += c.quantity;
      byCategory[product.category].spent += c.price * c.quantity;
    });

    const categoryData = Object.entries(byCategory)
      .map(([key, val]) => ({
        name: CATEGORY_LABELS[key] || key,
        value: val.count,
        spent: val.spent,
        color: CATEGORY_COLORS[key] || "#6b7280",
      }))
      .sort((a, b) => b.value - a.value);

    // Top products
    const productCounts: Record<string, number> = {};
    const productSpending: Record<string, number> = {};
    consumption.forEach((c) => {
      productCounts[c.productId] =
        (productCounts[c.productId] || 0) + c.quantity;
      productSpending[c.productId] =
        (productSpending[c.productId] || 0) + c.price * c.quantity;
    });

    const topProducts = Object.entries(productCounts)
      .map(([id, count]) => ({
        product: products.find((p) => p.id === id),
        count,
        spent: productSpending[id] || 0,
      }))
      .filter((t) => t.product)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const maxProductCount =
      topProducts.length > 0 ? topProducts[0].count : 1;

    // By location
    const locationCounts: Record<string, number> = {};
    const locationSpending: Record<string, number> = {};
    consumption.forEach((c) => {
      locationCounts[c.locationId] =
        (locationCounts[c.locationId] || 0) + c.quantity;
      locationSpending[c.locationId] =
        (locationSpending[c.locationId] || 0) + c.price * c.quantity;
    });

    const locationData = Object.entries(locationCounts)
      .map(([id, count]) => {
        const loc = locations.find((l) => l.id === id);
        return {
          name: loc?.name || "Unknown",
          count,
          spent: locationSpending[id] || 0,
          color: loc?.color || "#6b7280",
        };
      })
      .sort((a, b) => b.count - a.count);

    // Monthly spending (bar chart)
    const monthlySpending: Record<string, number> = {};
    consumption.forEach((c) => {
      const month = format(new Date(c.date), "MMM yyyy");
      monthlySpending[month] =
        (monthlySpending[month] || 0) + c.price * c.quantity;
    });

    const monthlyData = Object.entries(monthlySpending)
      .map(([month, spent]) => ({ month, spent: Math.round(spent * 100) / 100 }))
      .slice(-6);

    // Inventory value
    const inventoryValue = inventory.reduce(
      (s, i) => s + i.buyPrice * i.quantity,
      0
    );
    const inventoryCount = inventory.reduce((s, i) => s + i.quantity, 0);

    return {
      totalConsumed,
      totalSpent,
      avgPricePerDrink,
      last30Spent,
      last30Count,
      last7Count,
      dailyData,
      categoryData,
      topProducts,
      maxProductCount,
      locationData,
      monthlyData,
      inventoryValue,
      inventoryCount,
    };
  }, [products, locations, inventory, consumption]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your drinking habits at a glance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <GlassWater className="h-4 w-4 text-blue-400" />
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Total Consumed
              </span>
            </div>
            <p className="text-3xl font-bold">{analytics.totalConsumed}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.last7Count} this week
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="h-4 w-4 text-green-400" />
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Total Spent
              </span>
            </div>
            <p className="text-3xl font-bold">
              €{analytics.totalSpent.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              €{analytics.last30Spent.toFixed(2)} last 30d
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-400" />
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Avg Price
              </span>
            </div>
            <p className="text-3xl font-bold">
              €{analytics.avgPricePerDrink.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">per drink</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBasket className="h-4 w-4 text-purple-400" />
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Inventory
              </span>
            </div>
            <p className="text-3xl font-bold">{analytics.inventoryCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              €{analytics.inventoryValue.toFixed(2)} value
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="space-y-6 pb-4">
          {/* Consumption Trend */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Last 30 Days
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyData}>
                    <defs>
                      <linearGradient
                        id="consumptionGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                      interval={6}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      fill="url(#consumptionGradient)"
                      strokeWidth={2}
                      name="Drinks"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Pie */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-400" />
                  By Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {analytics.categoryData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {analytics.categoryData.map((cat) => (
                    <Badge
                      key={cat.name}
                      variant="secondary"
                      className="text-[10px]"
                      style={{
                        backgroundColor: cat.color + "20",
                        color: cat.color,
                      }}
                    >
                      {cat.name}: {cat.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Spending */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Euro className="h-4 w-4 text-green-400" />
                  Monthly Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.monthlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{
                          fontSize: 10,
                          fill: "hsl(var(--muted-foreground))",
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number) => [
                          `€${value.toFixed(2)}`,
                          "Spent",
                        ]}
                      />
                      <Bar
                        dataKey="spent"
                        fill="#22c55e"
                        radius={[6, 6, 0, 0]}
                        name="Spent"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                Most Consumed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topProducts.map(({ product, count, spent }, idx) => {
                  if (!product) return null;
                  return (
                    <div key={product.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-5 text-right">
                        {idx + 1}
                      </span>
                      <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-6 w-6 object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Droplets className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground shrink-0 ml-2">
                            {count}× · €{spent.toFixed(2)}
                          </p>
                        </div>
                        <Progress
                          value={(count / analytics.maxProductCount) * 100}
                          className="h-1.5"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Location Breakdown */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                Spending by Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.locationData.map((loc) => (
                  <div key={loc.name} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: loc.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {loc.name}
                        </p>
                        <p className="text-xs text-muted-foreground shrink-0 ml-2">
                          {loc.count} drinks · €{loc.spent.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
