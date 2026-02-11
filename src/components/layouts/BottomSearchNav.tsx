'use client';

import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export function BottomSearchNav() {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past the main search area (approx 300px)
      const show = window.scrollY > 300;
      setIsVisible(show);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up w-full max-w-sm px-4">
      <div 
        onClick={() => router.push('/search')}
        className="bg-white/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 shadow-2xl rounded-full p-2 pl-6 flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform duration-300"
      >
        <div className="flex-1 flex flex-col justify-center">
            <span className="text-xs font-bold text-gray-900">Where to?</span>
            <span className="text-[10px] text-gray-500 font-medium">Anywhere • Any week • Add guests</span>
        </div>
        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
            <FaSearch className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
