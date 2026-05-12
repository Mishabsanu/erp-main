// components/dashboard/charts/SalesPerUserChart.tsx
"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function SalesPerUserChart({ data }: { data: any[] }) {
  // data items: { name, total, userId, isMe? }
  const labels = data.map((d) => d.name || "Unknown");
  const values = data.map((d) => d.total || 0);

  // color: default and highlight logged user
  const background = data.map((d) => (d.isMe ? "#f59e0b" : "#0f766e"));

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border">
      <h3 className="text-lg font-semibold text-[#0f766e] mb-4">Sales Entries by Salesperson</h3>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Total Sales",
              data: values,
              backgroundColor: background,
              borderRadius: 6,
            },
          ],
        }}
        options={{ maintainAspectRatio: false }}
        height={260}
      />
    </div>
  );
}
