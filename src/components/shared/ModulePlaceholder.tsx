'use client';

import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ModulePlaceholderProps {
  title: string;
  moduleName: string;
}

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title, moduleName }) => {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white p-10 rounded-3xl border border-gray-100 shadow-sm animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center text-teal-700 mb-8 animate-bounce">
        <Construction size={48} />
      </div>
      
      <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
        {title} <span className="text-teal-700">Module</span>
      </h1>
      
      <p className="text-gray-500 text-lg mb-10 max-w-md text-center font-medium">
        This section under <span className="font-bold text-gray-800">{moduleName}</span> is currently under development. Stay tuned for advanced enterprise features.
      </p>

      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-gray-200"
      >
        <ArrowLeft size={18} />
        Go Back
      </button>

      <div className="mt-16 pt-8 border-t border-gray-50 w-full flex justify-center gap-10 grayscale opacity-50">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Advanced Analytics</p>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Automated Workflows</p>
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Real-time Sync</p>
      </div>
    </div>
  );
};

export default ModulePlaceholder;
