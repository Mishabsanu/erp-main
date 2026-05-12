import Image from 'next/image';
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="flex flex-col items-center gap-6 animate-pulse-subtle">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-t-teal-500 border-r-transparent border-b-teal-500 border-l-transparent animate-spin duration-1000" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Loading..."
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-teal-900 text-lg font-black uppercase tracking-[0.3em] ml-[0.3em]">Loading</span>
          <span className="text-teal-600 text-[10px] font-black uppercase tracking-widest opacity-70">Synchronizing Data</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
