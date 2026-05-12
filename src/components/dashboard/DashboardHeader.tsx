'use client';

export default function DashboardHeader({ role }: { role: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="h-10 w-1 bg-[#0f766e] rounded-full"></div>
      <h1 className="text-3xl md:text-4xl font-bold text-[#0f766e]">
        {role === 'admin'
          ? 'Admin Dashboard'
          : role === 'sales'
          ? 'Sales Dashboard'
          : 'Finance Dashboard'}
      </h1>
    </div>
  );
}
