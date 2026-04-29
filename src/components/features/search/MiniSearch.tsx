'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '@/i18n/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users } from 'lucide-react';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

export function MiniSearch({ onToggle }: { onToggle?: (expanded: boolean) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    searchParams.get('check_in') ? new Date(searchParams.get('check_in')!) : null,
    searchParams.get('check_out') ? new Date(searchParams.get('check_out')!) : null,
  ]);
  const [guests, setGuests] = useState(searchParams.get('guests') || '');
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (val: boolean) => {
    setIsExpanded(val);
    onToggle?.(val);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (dateRange[0]) params.set('check_in', dateRange[0].toISOString().split('T')[0]);
    if (dateRange[1]) params.set('check_out', dateRange[1].toISOString().split('T')[0]);
    if (guests) params.set('guests', guests);
    
    router.push(`/search?${params.toString()}`);
    toggleExpand(false);
  };

  return (
    <div className="relative">
      <motion.div 
        layout
        onClick={() => !isExpanded && toggleExpand(true)}
        className={`flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-white/10 backdrop-blur-xl cursor-pointer hover:bg-white/20 hover:shadow-lg transition-all ${isExpanded ? 'w-[380px]' : 'w-auto'}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-primary" />
          {!isExpanded ? (
            <div className="flex items-center gap-2 divide-x divide-primary/10 text-[10px] font-black tracking-widest text-primary truncate">
              <span className="px-2">{location || t({ id: 'Kemana saja', en: 'Anywhere' })}</span>
              <span className="px-2">{dateRange[0] ? dateRange[0].toLocaleDateString() : t({ id: 'Kapan saja', en: 'Any week' })}</span>
              <span className="px-2 text-primary/60">{guests ? `${guests} tamu` : t({ id: 'Tambah tamu', en: 'Add guests' })}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 w-full animate-in fade-in duration-300">
               <input 
                  autoFocus
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t({ id: 'Lokasi', en: 'Location' })}
                  className="bg-transparent border-none p-0 text-[10px] font-bold text-primary placeholder:text-primary/40 focus:ring-0 w-20"
                />
                <div className="h-3 w-px bg-primary/10" />
                <CustomDatePicker 
                  startDate={dateRange[0]} 
                  endDate={dateRange[1]} 
                  onChange={setDateRange}
                  showLabel={false}
                  triggerClassName="px-0 py-0 hover:bg-transparent text-[10px] font-bold text-primary"
                />
                <div className="h-3 w-px bg-primary/10" />
                <input 
                  type="number" 
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="0"
                  className="bg-transparent border-none p-0 text-[10px] font-bold text-primary placeholder:text-primary/40 focus:ring-0 w-6"
                />
            </div>
          )}
        </div>

        {isExpanded && (
          <button 
            onClick={(e) => { e.stopPropagation(); handleSearch(); }}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {isExpanded && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={(e) => { e.stopPropagation(); toggleExpand(false); }} 
        />
      )}
    </div>
  );
}
