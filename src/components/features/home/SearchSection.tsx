'use client';

import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { useLocations } from '@/hooks/useGlampings';
import { cn } from '@/lib/utils';

export function SearchSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState('');
  
  const { data: dbLocations } = useLocations();
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Fallback if DB is empty, but prioritizes DB locations
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
    <section className="relative -mt-20 md:-mt-16 z-30 container mx-auto px-4 max-w-6xl">
      <div className="bg-white/95 backdrop-blur-2xl rounded-[2rem] md:rounded-full border border-white shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] p-2 md:p-3 md:pl-10 flex flex-col md:flex-row items-stretch md:items-center gap-1 md:gap-2 max-w-5xl mx-auto group/search transition-all hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.2)]">
        
        {/* Location */}
        <div className="flex-1 relative flex flex-col justify-center px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-primary/10 hover:bg-primary/5 rounded-[1.5rem] md:rounded-none transition-colors">
            <label htmlFor="location" className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 mb-1">Where to?</label>
            <input 
                type="text" 
                id="location" 
                autoComplete="off"
                placeholder="Search destinations" 
                className="w-full outline-none text-sm md:text-base text-primary placeholder-primary/20 font-black bg-transparent"
                value={location}
                onChange={(e) => {
                    setLocation(e.target.value);
                    setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
            />

            {/* Suggestions Dropdown - SOLID Background */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div 
                    ref={suggestionRef}
                    className="absolute top-full left-0 mt-4 w-full md:w-[300px] bg-white rounded-[2rem] border border-black/5 shadow-2xl overflow-hidden py-4 z-50 animate-fade-up"
                >
                    <p className="px-6 pb-2 text-[9px] font-black uppercase tracking-widest text-primary/30">Available Sanctuaries</p>
                    <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        {filteredSuggestions.map((loc, i) => (
                            <button
                                key={i}
                                className="w-full px-6 py-3 flex items-center gap-4 hover:bg-primary/5 transition-colors text-left group"
                                onClick={() => selectSuggestion(loc)}
                            >
                                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                    <FaMapMarkerAlt size={12} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-primary">{loc}</p>
                                    <p className="text-[9px] font-bold text-primary/30 uppercase tracking-wider italic">Glamping Paradise</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        {/* Custom Date Picker */}
        <CustomDatePicker 
          startDate={startDate} 
          endDate={endDate} 
          onChange={setDateRange} 
        />

        {/* Guests */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4 md:py-0 hover:bg-primary/5 rounded-[1.5rem] md:rounded-none transition-colors">
             <label htmlFor="guests" className="block text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-primary/60 mb-1">How many?</label>
             <input 
                type="number" 
                id="guests" 
                placeholder="Add guests" 
                className="w-full outline-none text-sm md:text-base text-primary placeholder-primary/20 font-black bg-transparent"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                min="1"
            />
        </div>

        {/* Search Button */}
        <button 
            onClick={handleSearch}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl md:rounded-full py-5 md:px-10 md:py-5 flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary/20 active:scale-95 group/btn shrink-0"
        >
            <FaSearch className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
            <span className="font-black text-xs uppercase tracking-widest">Find Escape</span>
        </button>
      </div>
    </section>
  );
}
