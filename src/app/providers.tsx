'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import React from 'react';

// Shim for modern CSS color functions that some libraries (html2canvas) cannot parse
if (typeof window !== 'undefined') {
  const originalGetComputedStyle = window.getComputedStyle;
  window.getComputedStyle = function (el: Element, pseudo?: string | null) {
    const style = originalGetComputedStyle(el, pseudo);
    
    // We proxy the style object to intercept color properties
    return new Proxy(style, {
      get(target, prop) {
        const val = (target as any)[prop];
        // Intercept properties that might contain modern color functions
        if (typeof val === 'string' && (val.includes('lab(') || val.includes('oklch('))) {
          // Replace with a safe fallback (black for text, transparent/solid for backgrounds)
          // html2canvas specifically fails on these strings
          return val.replace(/lab\([^)]+\)/g, 'rgb(0, 0, 0)').replace(/oklch\([^)]+\)/g, 'rgb(0, 0, 0)');
        }
        if (typeof val === 'function') {
           return val.bind(target);
        }
        return val;
      }
    }) as CSSStyleDeclaration;
  };
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
