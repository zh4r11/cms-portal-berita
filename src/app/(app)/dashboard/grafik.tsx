"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

export type BarisKunjungan = { tanggal: string; pengunjung: number; hits: number };

const chartConfig = {
  pengunjung: { label: "Pengunjung", color: "var(--primary)" },
  hits: { label: "Halaman dibuka", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

/** Pengunjung unik per hari (batang). Tanpa animasi: MOTION 1, angka di atas sudah bergerak. */
export function GrafikKunjungan({ data }: { data: BarisKunjungan[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-64 w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="tanggal" tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="pengunjung" fill="var(--color-pengunjung)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ChartContainer>
  );
}
