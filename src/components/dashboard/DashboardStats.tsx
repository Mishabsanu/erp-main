// components/dashboard/DashboardStats.tsx
"use client";
import React from "react";

type Props = { data: any };

const StatCard = ({ title, value, color = "bg-white" }: any) => (
  <div className={`p-5 rounded-2xl shadow-sm border ${color}`}>
    <p className="text-sm text-gray-600">{title}</p>
    <h3 className="text-2xl font-bold text-[#0f766e]">{value ?? "-"}</h3>
  </div>
);

export default function DashboardStats({ data }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      <StatCard title="Total Products" value={data.totalProducts} />
      <StatCard title="Total Users" value={data.totalUsers} />
      <StatCard title="Total Sales Enquiries" value={data.totalSales} />
      <StatCard title="Total Quotes" value={data.totalQuotes} />
      <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-3">
        <StatCard title="Quotes - Accepted" value={data.acceptedQuotes} color="" />
        <StatCard title="Quotes - Quoted" value={data.quotedQuotes} color="" />
        <StatCard title="Quotes - Rejected" value={data.rejectedQuotes} color="" />
        <StatCard title="Quotes - Pending" value={data.pendingQuotesCount} color="" />
      </div>
    </div>
  );
}
