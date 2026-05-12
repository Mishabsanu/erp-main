'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="main-wrapper h-screen bg-[var(--bg-main)]">
      <Sidebar />
      <div className="content-area flex-1 overflow-hidden">
        <Header />
        <main className="page-content flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="max-w-full mx-auto animate-fade-in flex-1 w-full">{children}</div>

          {/* Global Footer */}
          <footer className="w-full text-center pt-8 mt-auto text-[11px] font-semibold text-gray-400 tracking-wide">
            <p>&copy; {new Date().getFullYear()} PROSERVE. All rights reserved.</p>
            <p className="mt-1">
              Powered by <span className="text-[#0f766e] font-bold">AKODTECH</span>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;
