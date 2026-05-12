import React from 'react';

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen w-full p-6 md:p-10 bg-[#f8fafc] animate-pulse">
      {/* HEADER SECTION SKELETON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white rounded-3xl w-16 h-16 shadow-sm border border-gray-100" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-gray-200 rounded-full" />
            <div className="h-8 w-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="space-y-2 text-right">
            <div className="h-2 w-24 bg-gray-200 rounded-full ml-auto" />
            <div className="h-4 w-40 bg-gray-200 rounded-lg" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100" />
        </div>
      </div>

      <div className="space-y-12">
        {/* STATS CARDS SKELETON */}
        <section>
          <div className="h-4 w-32 bg-gray-200 rounded-full mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-40">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl mb-4" />
                <div className="h-2 w-20 bg-gray-200 rounded-full mb-2" />
                <div className="h-8 w-24 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        </section>

        {/* MAIN ANALYTICS SKELETON */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 h-[450px]">
             <div className="flex justify-between mb-10">
                <div className="space-y-2">
                   <div className="h-3 w-40 bg-gray-200 rounded-full" />
                   <div className="h-6 w-60 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-10 w-24 bg-gray-200 rounded-lg" />
             </div>
             <div className="w-full h-64 bg-gray-50 rounded-2xl" />
          </div>
          <div className="bg-[#0f766e]/5 p-10 rounded-[3rem] border border-[#0f766e]/10 h-[450px] flex flex-col justify-between">
             <div className="space-y-2">
                <div className="h-6 w-40 bg-gray-200 rounded-lg" />
                <div className="h-3 w-24 bg-gray-200 rounded-full" />
             </div>
             <div className="space-y-6">
                <div className="h-24 w-full bg-white/50 rounded-3xl" />
                <div className="h-24 w-full bg-white/50 rounded-3xl" />
             </div>
             <div className="h-4 w-full bg-gray-200 rounded-full" />
          </div>
        </section>

        {/* OPERATIONS SKELETON */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <div className="bg-white p-10 rounded-[3rem] h-64 shadow-sm border border-gray-100" />
           <div className="bg-white p-10 rounded-[3rem] h-64 shadow-sm border border-gray-100" />
        </section>

        {/* RECENT ACTIVITY SKELETON */}
        <section className="pb-20">
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 h-96" />
        </section>
      </div>
    </div>
  );
};
