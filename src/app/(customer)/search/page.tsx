'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGlampings, useLocations } from '@/hooks/useGlampings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Filter, Search, Heart, Calendar, Users, X, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { toast } from 'sonner';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Component that reads search params
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarStyle, setSidebarStyle] = useState<React.CSSProperties>({});
  const [isSticky, setIsSticky] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Search states synced with URL
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    searchParams.get('check_in') ? new Date(searchParams.get('check_in')!) : null,
    searchParams.get('check_out') ? new Date(searchParams.get('check_out')!) : null,
  ]);
  const [guests, setGuests] = useState(searchParams.get('guests') || '');

  // Suggestions logic
  const { data: dbLocations } = useLocations();
  const locations = dbLocations || ["Lembang", "Ciwidey", "Kintamani", "Ubud", "Puncak", "Bogor", "Yogyakarta"];
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const filteredSuggestions = locations.filter(loc => 
    loc.toLowerCase().includes(location.toLowerCase())
  );

  const [filters, setFilters] = useState({
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    access_type: searchParams.get('access_type') || '',
    bathroom_type: searchParams.get('bathroom_type') || '',
    pet_friendly: searchParams.get('pet_friendly') || '',
    has_wifi: searchParams.get('has_wifi') || '',
    has_electricity: searchParams.get('has_electricity') || '',
  });

  const { data, isLoading, isError } = useGlampings({
    location: searchParams.get('location') || '',
    check_in: searchParams.get('check_in') || undefined,
    check_out: searchParams.get('check_out') || undefined,
    guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
    min_price: filters.min_price ? Number(filters.min_price) : undefined,
    max_price: filters.max_price ? Number(filters.max_price) : undefined,
    access_type: filters.access_type || undefined,
    bathroom_type: filters.bathroom_type || undefined,
    pet_friendly: filters.pet_friendly ? filters.pet_friendly === 'true' : undefined,
    has_wifi: filters.has_wifi ? filters.has_wifi === 'true' : undefined,
    has_electricity: filters.has_electricity ? filters.has_electricity === 'true' : undefined,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (dateRange[0]) params.set('check_in', dateRange[0].toISOString().split('T')[0]);
    if (dateRange[1]) params.set('check_out', dateRange[1].toISOString().split('T')[0]);
    if (guests) params.set('guests', guests);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    if (filters.access_type) params.set('access_type', filters.access_type);
    if (filters.bathroom_type) params.set('bathroom_type', filters.bathroom_type);
    if (filters.pet_friendly) params.set('pet_friendly', filters.pet_friendly);
    if (filters.has_wifi) params.set('has_wifi', filters.has_wifi);
    if (filters.has_electricity) params.set('has_electricity', filters.has_electricity);
    router.push(`/search?${params.toString()}`);
    setIsSearchOpen(false);
  };

  useEffect(() => {
    setLocation(searchParams.get('location') || '');
    setGuests(searchParams.get('guests') || '');
    const ci = searchParams.get('check_in');
    const co = searchParams.get('check_out');
    setDateRange([ci ? new Date(ci) : null, co ? new Date(co) : null]);
    setFilters({
      min_price: searchParams.get('min_price') || '',
      max_price: searchParams.get('max_price') || '',
      access_type: searchParams.get('access_type') || '',
      bathroom_type: searchParams.get('bathroom_type') || '',
      pet_friendly: searchParams.get('pet_friendly') || '',
      has_wifi: searchParams.get('has_wifi') || '',
      has_electricity: searchParams.get('has_electricity') || '',
    });
  }, [searchParams]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saved_glampings');
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setSavedSlugs(parsed);
    } catch {
      setSavedSlugs([]);
    }
  }, []);

  // Back to original sticky sidebar logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsSticky(currentScroll > 80);

      if (window.innerWidth < 1024) {
        setSidebarStyle({});
        return;
      }
      const container = containerRef.current;
      const sidebar = sidebarRef.current;
      if (!container || !sidebar) return;

      const topOffset = 220; 
      const startOffset = 0;
      const paddingX = 16;
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top + window.scrollY;
      const containerLeft = containerRect.left + window.scrollX;
      const sidebarHeight = sidebar.offsetHeight;
      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : null;
      const containerHeight = container.offsetHeight;
      const containerBottom = containerTop + containerHeight;
      const stopGap = 64;
      const stopAt = Math.min(containerBottom, footerTop ?? containerBottom) - stopGap;
      const maxTop = stopAt - sidebarHeight;

      if (currentScroll + topOffset + sidebarHeight >= stopAt) {
        setSidebarStyle({
          position: 'absolute',
          top: Math.max(startOffset, maxTop - containerTop),
          left: 0,
          width: sidebar.offsetWidth,
        });
      } else if (currentScroll + topOffset >= containerTop) {
        setSidebarStyle({
          position: 'fixed',
          top: topOffset,
          left: containerLeft + paddingX,
          width: sidebar.offsetWidth,
        });
      } else {
        setSidebarStyle({
          position: 'absolute',
          top: startOffset,
          left: 0,
          width: sidebar.offsetWidth,
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);


  const toggleSave = (slug: string) => {
    try {
      const next = savedSlugs.includes(slug)
        ? savedSlugs.filter((s) => s !== slug)
        : [...savedSlugs, slug];
      localStorage.setItem('saved_glampings', JSON.stringify(next));
      setSavedSlugs(next);
      toast.success(next.includes(slug)
        ? t({ id: 'Disimpan ke wishlist', en: 'Saved to wishlist' })
        : t({ id: 'Dihapus dari wishlist', en: 'Removed from wishlist' })
      );
    } catch {
      toast.error(t({ id: 'Gagal menyimpan', en: 'Failed to save' }));
    }
  };

  const formatDateLabel = () => {
    if (dateRange[0] && dateRange[1]) {
      return `${dateRange[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${dateRange[1].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;
    }
    return t({ id: 'Pilih Tanggal', en: 'Add dates' });
  };

  return (
    <div ref={containerRef} className="container mx-auto px-4 py-8 pb-32 lg:pb-8">
      
      {/* 1. DESKTOP SEARCH BAR (Top Sticky) - Fixed overflow to show DatePicker */}
      <div className={cn(
        "hidden lg:block sticky top-20 z-40 transition-all duration-500 -mx-4 px-4 py-4 bg-background/30 backdrop-blur-sm",
        !isSticky && "lg:relative lg:top-0 lg:mb-10 lg:bg-transparent lg:backdrop-blur-none lg:px-0 lg:py-0"
      )}>
        <div className={cn(
            "bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-xl mx-auto flex transition-all duration-500 ring-1 ring-black/5",
            isSticky ? "max-w-4xl p-1.5" : "max-w-5xl p-2.5",
        )}>
          {/* Desktop inputs */}
          <div className="flex w-full items-center gap-1.5">
            <div className="flex-[1.2] flex items-center gap-3 px-5 py-2 rounded-2xl hover:bg-black/5 transition-colors cursor-pointer group">
                <MapPin className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                <label className="block text-[8px] font-black text-primary/40 uppercase tracking-widest">{t({ id: 'Lokasi', en: 'Location' })}</label>
                <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t({ id: 'Mau kemana?', en: 'Where to?' })}
                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-primary placeholder:text-primary/20 focus:ring-0"
                />
                </div>
            </div>
            <div className="w-px h-6 bg-primary/10" />
            <div className="flex-1 flex items-center gap-3 px-5 py-2 rounded-2xl hover:bg-black/5 transition-colors cursor-pointer group">
                <Calendar className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                <label className="block text-[8px] font-black text-primary/40 uppercase tracking-widest">{t({ id: 'Tanggal', en: 'Dates' })}</label>
                <CustomDatePicker 
                    startDate={dateRange[0]} 
                    endDate={dateRange[1]} 
                    onChange={setDateRange}
                    showLabel={false}
                    className="w-full"
                    triggerClassName="px-0 py-0 hover:bg-transparent h-auto text-xs font-bold text-primary"
                />
                </div>
            </div>
            <div className="w-px h-6 bg-primary/10" />
            <div className="flex-[0.8] flex items-center gap-3 px-5 py-2 rounded-2xl hover:bg-black/5 transition-colors cursor-pointer group">
                <Users className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                <div className="flex-1">
                <label className="block text-[8px] font-black text-primary/40 uppercase tracking-widest">{t({ id: 'Tamu', en: 'Guests' })}</label>
                <input 
                    type="number" 
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    placeholder={t({ id: 'Berapa?', en: 'Add guests' })}
                    className="w-full bg-transparent border-none p-0 text-xs font-bold text-primary placeholder:text-primary/20 focus:ring-0"
                />
                </div>
            </div>
            <button onClick={handleSearch} className="p-3.5 bg-primary text-white rounded-2xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"><Search className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* 2. MOBILE FLOATING BUTTON (Airbnb Style) */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[140] w-[calc(100%-2rem)] max-w-sm">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSearchOpen(true)}
          className="w-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-full py-4 px-6 flex items-center justify-between border border-black/5 transition-all ring-1 ring-black/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <Search className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black text-primary leading-none mb-1">{location || t({ id: 'Mulai pencarian', en: 'Start searching' })}</span>
              <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                {formatDateLabel()} • {guests || 1} {t({ id: 'Tamu', en: 'Guests' })}
              </span>
            </div>
          </div>
          <div className="p-2 rounded-full bg-primary/5 text-primary/40">
            <Filter className="w-4 h-4" />
          </div>
        </motion.button>
      </div>

      {/* 3. MOBILE SEARCH OVERLAY (Airbnb Style) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="lg:hidden fixed inset-0 z-[150] bg-white flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 p-6 flex items-center justify-between border-b bg-white relative z-0">
              <button onClick={() => setIsSearchOpen(false)} className="p-2 rounded-full hover:bg-black/5">
                <X className="w-6 h-6 text-primary" />
              </button>
              <h2 className="text-lg font-black text-primary">{t({ id: 'Cari Glamping', en: 'Search Glamping' })}</h2>
              <div className="w-10" />
            </div>

            {/* Content Area - Essential: relative z-0 and overflow-visible for the children popovers */}
            <div className="flex-1 overflow-y-auto p-6 space-y-10 relative z-0">
              {/* Location Section */}
              <div className="space-y-4 relative">
                <div className="flex items-center gap-2 text-accent">
                    <MapPin className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">{t({ id: 'Tentukan Lokasi', en: 'Set Location' })}</span>
                </div>
                <div className="relative">
                    <Input 
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value);
                            setShowLocSuggestions(true);
                        }}
                        onFocus={() => setShowLocSuggestions(true)}
                        placeholder={t({ id: 'Contoh: Lembang, Bandung', en: 'e.g. Lembang, Bandung' })}
                        className="h-14 rounded-2xl text-base font-bold bg-black/5 border-none focus:ring-2 focus:ring-primary/20"
                    />
                    <AnimatePresence>
                        {showLocSuggestions && filteredSuggestions.length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-black/5 z-[100000] overflow-hidden p-2 ring-1 ring-black/5"
                            >
                                {filteredSuggestions.map((loc, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setLocation(loc);
                                            setShowLocSuggestions(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-4 hover:bg-black/5 rounded-xl transition-colors text-left border-b border-black/[0.03] last:border-0"
                                    >
                                        <MapPin className="w-4 h-4 text-accent" />
                                        <span className="text-base font-bold text-primary">{loc}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              </div>

              {/* Dates Section - Kept z-30 for DatePicker visibility */}
              <div className="space-y-4 relative z-30">
                <div className="flex items-center gap-2 text-accent">
                    <Calendar className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">{t({ id: 'Kapan Menginap?', en: 'When?' })}</span>
                </div>
                <div className="bg-black/5 rounded-2xl overflow-visible">
                    <CustomDatePicker 
                        startDate={dateRange[0]} 
                        endDate={dateRange[1]} 
                        onChange={setDateRange}
                        showLabel={false}
                        className="w-full"
                        triggerClassName="h-14 text-base font-bold text-primary justify-start px-5 hover:bg-transparent"
                    />
                </div>
              </div>

              {/* Guests Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">{t({ id: 'Berapa Orang?', en: 'Who?' })}</span>
                </div>
                <Input 
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    placeholder={t({ id: 'Jumlah Tamu', en: 'Number of Guests' })}
                    className="h-14 rounded-2xl text-base font-bold bg-black/5 border-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              {/* Extra spacing to allow scrolling past popovers if needed */}
              <div className="h-40" />
            </div>

            {/* Footer */}
            <div className="shrink-0 p-6 border-t bg-white relative z-0 flex items-center justify-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              <Button onClick={handleSearch} className="h-14 w-full rounded-2xl bg-primary text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all">
                <Search className="w-5 h-5" />
                {t({ id: 'Cari Sekarang', en: 'Search' })}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Sidebar Filters - Back to original manual sticky logic */}
        <aside className="w-full lg:w-72 relative z-20">
            <div
              ref={sidebarRef}
              style={sidebarStyle}
              className="glass p-6 md:p-7 lg:p-8 rounded-[2.5rem] border-white/40 shadow-2xl space-y-8 bg-white/90"
            >
            <div className="flex items-center gap-3 font-black text-xl text-primary tracking-tight">
              <Filter className="w-5 h-5 text-accent" /> {t({ id: 'Perbaiki Pencarian', en: 'Refine' })}
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Rentang Budget', en: 'Budget Range' })}</label>
              <div className="flex flex-col gap-3">
                <Input 
                  placeholder={t({ id: 'Min Rp', en: 'Min Rp' })} 
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="rounded-xl h-10 px-4"
                />
                <Input 
                  placeholder={t({ id: 'Max Rp', en: 'Max Rp' })} 
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="rounded-xl h-10 px-4"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Akses', en: 'Access' })}</label>
              <select
                value={filters.access_type}
                onChange={(e) => handleFilterChange('access_type', e.target.value)}
                className="h-10 w-full rounded-xl border border-primary/10 bg-white/70 px-3 text-xs font-bold text-primary"
              >
                <option value="">{t({ id: 'Semua Akses', en: 'All Access' })}</option>
                <option value="city_car">{t({ id: 'Mobil Kota', en: 'City Car' })}</option>
                <option value="suv_only">{t({ id: 'SUV/4x4', en: 'SUV/4x4' })}</option>
                <option value="motor_only">{t({ id: 'Motor Saja', en: 'Motorbike Only' })}</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Kamar Mandi', en: 'Bathroom' })}</label>
              <select
                value={filters.bathroom_type}
                onChange={(e) => handleFilterChange('bathroom_type', e.target.value)}
                className="h-10 w-full rounded-xl border border-primary/10 bg-white/70 px-3 text-xs font-bold text-primary"
              >
                <option value="">{t({ id: 'Semua', en: 'All' })}</option>
                <option value="private">{t({ id: 'Private', en: 'Private' })}</option>
                <option value="shared">{t({ id: 'Shared', en: 'Shared' })}</option>
                <option value="none">{t({ id: 'Tanpa Kamar Mandi', en: 'No Bathroom' })}</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Fasilitas', en: 'Essentials' })}</label>
              <div className="space-y-2 text-xs font-bold text-primary/70">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.pet_friendly === 'true'}
                    onChange={(e) => handleFilterChange('pet_friendly', e.target.checked ? 'true' : '')}
                  />
                  {t({ id: 'Pet Friendly', en: 'Pet Friendly' })}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.has_wifi === 'true'}
                    onChange={(e) => handleFilterChange('has_wifi', e.target.checked ? 'true' : '')}
                  />
                  {t({ id: 'WiFi', en: 'WiFi' })}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.has_electricity === 'true'}
                    onChange={(e) => handleFilterChange('has_electricity', e.target.checked ? 'true' : '')}
                  />
                  {t({ id: 'Listrik', en: 'Electricity' })}
                </label>
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handleSearch}>{t({ id: 'Terapkan Filter', en: 'Apply Filter' })}</Button>
            </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1 w-full">
          <div className="mb-10 flex flex-col gap-2">
            <h1 className="text-4xl font-black text-primary tracking-tighter">{t({ id: 'Pilihan Escape Tersedia', en: 'Available Escapes' })}</h1>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">
               {isLoading 
                 ? t({ id: 'Memindai alam liar...', en: 'Scanning wildness...' }) 
                 : t({ id: `${data?.meta?.total || 0} tempat ditemukan`, en: `${data?.meta?.total || 0} sanctuaries found` })}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-4 w-1/2 rounded-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 glass rounded-[3rem] border-red-100 text-red-600 font-bold">
              Wildness connection lost. Please try again.
            </div>
          ) : data?.data.length === 0 ? (
          <div className="text-center py-16 md:py-24 glass rounded-[3.5rem] border-white/40 text-primary/30">
              <Search className="w-16 h-16 mx-auto mb-6 opacity-10" />
              <p className="font-black uppercase tracking-[0.2em] text-sm">{t({ id: 'Tidak ada tempat yang sesuai kriteria', en: 'No sanctuaries match your criteria' })}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-8 w-full">
              {data?.data.map((glamping) => {
                const storageBase = (process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage/').replace(/\/+$/, '/') ;
                const imageUrl = glamping.thumbnail?.startsWith('http') 
                    ? glamping.thumbnail 
                    : glamping.thumbnail 
                        ? `${storageBase}${glamping.thumbnail.replace(/^\/+/, '')}`
                        : 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80';
                const isSaved = savedSlugs.includes(glamping.slug);

                return (
                    <Link href={`/glamping/${glamping.slug}`} key={glamping.id} className="group">
                    <div className="relative glass rounded-[2.5rem] border-white/40 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                        <div className="p-3 pb-0">
                            <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-gray-100">
                            <Image
                                src={imageUrl} 
                                alt={glamping.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-4 right-4">
                                <Badge className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full">
                                <Star className="w-3 h-3 fill-accent text-accent mr-1" />
                                {glamping.rating}
                                </Badge>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSave(glamping.slug);
                              }}
                              className={`absolute top-4 left-4 w-10 h-10 rounded-full backdrop-blur-md border border-white/30 flex items-center justify-center transition-all ${
                                isSaved ? 'bg-primary text-primary-foreground' : 'bg-white/70 text-primary/60 hover:text-primary'
                              }`}
                              aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                            >
                              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                            {isSaved && (
                              <div className="absolute bottom-4 left-4 glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full">
                                {t({ id: 'Tersimpan', en: 'Saved' })}
                              </div>
                            )}
                            </div>
                        </div>
                        <div className="p-6 pt-4 flex flex-col flex-1">
                            <h3 className="font-black text-xl text-primary tracking-tight line-clamp-1 group-hover:text-accent transition-colors">{glamping.name}</h3>
                            <div className="flex items-center gap-1.5 text-primary/40 text-[10px] font-black uppercase tracking-widest mt-2">
                                <MapPin className="w-3 h-3" />
                                {glamping.location}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4 mb-3">
                                {glamping.vibe && (
                                    <span className="text-[9px] px-3 py-1 bg-primary/5 text-primary/60 rounded-full uppercase font-black tracking-widest">
                                        {glamping.vibe}
                                    </span>
                                )}
                                {glamping.pet_friendly && (
                                    <span className="text-[9px] px-3 py-1 bg-accent/10 text-accent rounded-full uppercase font-black tracking-widest">
                                        Pet Friendly
                                    </span>
                                )}
                                {glamping.has_wifi && (
                                    <span className="text-[9px] px-3 py-1 bg-primary/5 text-primary/60 rounded-full uppercase font-black tracking-widest">
                                        WiFi
                                    </span>
                                )}
                                {glamping.bathroom_type && (
                                    <span className="text-[9px] px-3 py-1 bg-primary/5 text-primary/60 rounded-full uppercase font-black tracking-widest">
                                        {glamping.bathroom_type}
                                    </span>
                                )}
                            </div>
                            <div className="mt-auto pt-7 border-t border-primary/5 flex justify-between items-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary/30">{t({ id: 'Mulai', en: 'From' })}</div>
                                <div className="text-xl font-black text-primary">
                                    <span className="text-sm font-bold mr-1 italic text-primary/30">Rp</span>
                                    {(glamping.price || 0).toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>
                    </div>
                    </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense
export default function SearchPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="container mx-auto p-8">{t({ id: 'Memuat pencarian...', en: 'Loading search...' })}</div>}>
      <SearchContent />
    </Suspense>
  );
}
