'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { useLocations } from '@/hooks/useGlampings';
import { useI18n } from '@/i18n/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Users, Calendar } from 'lucide-react';
import { slideUp } from '@/lib/animations';

export function SearchSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState('');
  const { t } = useI18n();
  
  const { data: dbLocations } = useLocations();
  const suggestionRef = useRef<HTMLDivElement>(null);

  const locations = dbLocations || ["Lembang", "Ciwidey", "Kintamani", "Ubud", "Puncak", "Bogor", "Yogyakarta"];

  const filteredSuggestions = locations.filter(loc => 
    loc.toLowerCase().includes(location.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (startDate) params.set('check_in', startDate.toISOString().split('T')[0]);
    if (endDate) params.set('check_out', endDate.toISOString().split('T')[0]);
    if (guests) params.set('guests', guests);
    
    router.push(`/search?${params.toString()}`);
  };

  const selectSuggestion = (loc: string) => {
    setLocation(loc);
    setShowSuggestions(false);
  };

  return (
    <section className="relative -mt-28 z-30 container mx-auto px-4 pointer-events-none">
      <motion.div 
        variants={slideUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="group pointer-events-auto bg-white/90 dark:bg-black/70 backdrop-blur-2xl rounded-[3rem] border border-white/30 shadow-[0_24px_80px_rgba(0,0,0,0.22)] p-4 sm:p-5 max-w-5xl xl:max-w-[70rem] mx-auto relative transition-all duration-300 focus-within:shadow-[0_30px_110px_rgba(0,0,0,0.28)] focus-within:-translate-y-1.5 focus-within:scale-[1.015]"
      >
        <div className="absolute -top-20 -right-24 w-64 h-64 bg-accent/12 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/12 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-6 left-8 text-[11px] font-black uppercase tracking-[0.2em] text-primary/60">
          {t({ id: 'Temukan Villa', en: 'Find your villa' })}
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-3 pt-5">
          
          {/* Location Input */}
          <div className="relative flex-1 w-full group">
            <div className="flex items-center gap-3 px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  {t({ id: 'Destinasi', en: 'Destination' })}
                </label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={t({ id: 'Mau kemana?', en: 'Where to go?' })}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:ring-0 truncate"
                />
              </div>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div 
                  ref={suggestionRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-full lg:w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-black/5 overflow-hidden z-50 p-2"
                >
                  <p className="px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {t({ id: 'Lokasi Populer', en: 'Popular Locations' })}
                  </p>
                  <div className="max-h-[240px] overflow-y-auto">
                    {filteredSuggestions.map((loc, i) => (
                      <button
                        key={i}
                        onClick={() => selectSuggestion(loc)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/10 rounded-xl transition-colors text-left group/item"
                      >
                        <MapPin className="w-4 h-4 text-muted-foreground group-hover/item:text-accent" />
                        <span className="text-sm font-medium text-foreground">{loc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:block w-px h-10 bg-border mx-2" />

          {/* Date Picker */}
          <div className="flex-1 w-full group">
            <div className="flex items-center gap-3 px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  {t({ id: 'Tanggal', en: 'Dates' })}
                </label>
                <CustomDatePicker 
                  startDate={startDate} 
                  endDate={endDate} 
                  onChange={setDateRange}
                  showLabel={false}
                  className="w-full"
                  triggerClassName="px-0 py-0 hover:bg-transparent"
                />
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-px h-10 bg-border mx-2" />

          {/* Guests Input */}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
                  {t({ id: 'Tamu', en: 'Guests' })}
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder={t({ id: 'Jumlah orang', en: 'Add guests' })}
                  className="w-full bg-transparent border-none p-0 text-sm font-semibold text-foreground placeholder:text-muted-foreground/50 focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="w-full lg:w-auto px-6 py-4 bg-primary text-primary-foreground rounded-[1.4rem] hover:scale-105 active:scale-95 transition-all shadow-[0_16px_40px_rgba(16,103,74,0.35)] hover:shadow-[0_20px_50px_rgba(16,103,74,0.45)] flex items-center justify-center gap-2"
          >
            <Search className="w-6 h-6" />
            <span className="lg:hidden font-bold">{t({ id: 'Cari', en: 'Search' })}</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
