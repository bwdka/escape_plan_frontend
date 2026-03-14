'use client';

import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useRouter, usePathname } from 'next/navigation';
import { useI18n } from '@/i18n/I18nProvider';

export function BottomSearchNav() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      // Only show on landing page
      if (pathname !== '/') {
        setIsVisible(false);
        return;
      }
      
      const show = window.scrollY > 400;
      setIsVisible(show);
    };

    handleScroll(); // Check immediately on mount/path change
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-fade-up w-[calc(100%-3rem)] max-w-[280px] sm:max-w-sm px-0">
      <div 
        onClick={() => router.push('/search')}
        className="glass rounded-full p-1 md:p-1.5 pl-5 md:pl-8 flex items-center gap-3 md:gap-4 cursor-pointer hover:scale-[1.02] md:hover:scale-105 hover:bg-white/60 active:scale-95 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-white/40 group"
      >
        <div className="flex-1 flex flex-col justify-center py-1 overflow-hidden text-left">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] text-primary/80">{t({ id: 'Mulai perjalananmu', en: 'Start your journey' })}</span>
            <span className="text-[11px] md:text-xs text-primary/60 font-bold truncate">{t({ id: 'Cari destinasi...', en: 'Search destinations...' })}</span>
        </div>
        <div className="w-9 h-9 md:w-12 md:h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500 shrink-0">
            <FaSearch className="w-3 md:w-4 h-3 md:h-4" />
        </div>
      </div>
    </div>
  );
}
