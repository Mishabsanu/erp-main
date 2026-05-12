'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, User } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-white via-[#f8fafc] to-[#0f766e]/10 backdrop-blur-xl flex items-center justify-between px-10 border-b border-[#0f766e]/20 shadow-sm transition-all duration-300 h-20">
      {/* Search Bar / Welcome Section */}
      <div className="flex items-center gap-6 flex-1 h-full">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-[#0f766e]" />
          <input
            type="text"
            placeholder="Search for everything..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f766e]/10 focus:border-[#0f766e]/20 transition-all w-80 font-medium text-[#1e293b]"
          />
        </div>
        <div className="md:hidden">
          <h1 className="text-xl font-black text-[#1e293b] tracking-tight flex items-center gap-2">
            <span className="w-2 h-8 bg-[#0f766e] rounded-full" />
            AKOD <span className="text-[#0f766e] uppercase">ERP</span>
          </h1>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-5 h-full">
        <button className="relative p-2.5 text-[#1e293b] hover:text-[#0f766e] hover:bg-[#0f766e]/5 rounded-2xl transition-all duration-300">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#14b8a6] rounded-full border-2 border-white" />
        </button>

        <div className="h-8 w-[1px] bg-[#0f766e]/10 mx-2" />

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-[#0f766e] leading-none truncate max-w-[150px]">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] font-black text-[#64748b] uppercase tracking-widest mt-1">
                {typeof user.role === 'object' && user.role ? user.role.name : 'User'}
              </p>
            </div>
            <button className="w-11 h-11 bg-gradient-to-tr from-[#0f766e] to-[#0ea5e9] p-[2px] rounded-2xl shadow-lg hover:shadow-[#0f766e]/20 transition-all duration-300 group">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gray-50 text-[#0f766e] flex items-center justify-center font-black text-sm group-hover:bg-gray-100 uppercase">
                  {user?.email?.charAt(0) || <User size={18} />}
                </div>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
