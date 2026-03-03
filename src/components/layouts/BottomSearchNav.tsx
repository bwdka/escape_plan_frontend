'use client';

import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';

export function BottomSearchNav() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      // Only show on landing page
      if (pathname !== '/') {
        setIsVisible(false);
        return;
      }
      
      const show = window.scrollY > 300;
      setIsVisible(show);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up w-[calc(100%-2rem)] md:max-w-sm px-0">
      <div 
        onClick={() => router.push('/search')}
        className="glass rounded-full p-1.5 pl-6 md:pl-8 flex items-center gap-3 md:gap-4 cursor-pointer hover:scale-[1.02] md:hover:scale-105 hover:bg-white/60 transition-all duration-500 shadow-2xl border-white/40 group"
      >
        <div className="flex-1 flex flex-col justify-center py-1">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary">Start your journey</span>
            <span className="text-xs text-primary/60 font-bold truncate">Search destinations...</span>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500 shrink-0">
            <FaSearch className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </div>
      </div>
    </div>
  );
}
