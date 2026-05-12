// components/dashboard/charts/QuotesPerUserChart.tsx
"use client";
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function QuotesPerUserChart({ data }: { data: any[] }) {
  const labels = data.map((d) => d.name || "Unknown");
  const values = data.map((d) => d.total || 0);

  // pick a set of colors (will repeat if many)
  const colors = [
    "#0f766e",
    "#2563eb",
    "#10b981",
    "#f59e0b",
    "#7c3aed",
    "#ef4444",
    "#15803d",
  ];
  const backgroundColor = labels.map((_, i) => colors[i % colors.length]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border">
      <h3 className="text-lg font-semibold text-[#0f766e] mb-4">Quotes by Handler</h3>
      <div style={{ height: 260 }}>
        <Pie
          data={{
            labels,
            datasets: [{ data: values, backgroundColor }],
          }}
          options={{ maintainAspectRatio: false }}
        />
      </div>
    </div>
  );
}
