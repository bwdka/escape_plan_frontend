'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGlampings, useLocations } from '@/hooks/useGlampings';
import { Glamping, GlampingFilterParams } from '@/types/glamping';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Filter, Search, Heart, Calendar, Users, X, PawPrint, Wifi, Zap, Images, Compass } from 'lucide-react';
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
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAnIGhlaWdodD0nMjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzMwJyBoZWlnaHQ9JzIyJyBmaWxsPSIjZWRlN2RlIi8+PC9zdmc+";
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarStyle, setSidebarStyle] = useState<CSSProperties>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Glamping[]>([]);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating_high'>('relevance');
  
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
    bathroom_type: (filters.bathroom_type || undefined) as GlampingFilterParams['bathroom_type'],
    pet_friendly: filters.pet_friendly ? filters.pet_friendly === 'true' : undefined,
    has_wifi: filters.has_wifi ? filters.has_wifi === 'true' : undefined,
    has_electricity: filters.has_electricity ? filters.has_electricity === 'true' : undefined,
    page,
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

  const handleResetFilters = () => {
    setLocation('');
    setGuests('');
    setDateRange([null, null]);
    setFilters({
      min_price: '',
      max_price: '',
      access_type: '',
      bathroom_type: '',
      pet_friendly: '',
      has_wifi: '',
      has_electricity: '',
    });
    router.push('/search');
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    setResults([]);
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
    if (!data?.data) return;
    if (page === 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults(data.data);
      return;
    }
    setResults((prev) => {
      const seen = new Set(prev.map((item) => item.id));
      const next = data.data.filter((item) => !seen.has(item.id));
      return [...prev, ...next];
    });
  }, [data?.data, page]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saved_glampings');
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSavedSlugs(parsed);
    } catch {
      setSavedSlugs([]);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (window.innerWidth < 1024) {
        setSidebarStyle({});
        return;
      }
      const container = containerRef.current;
      const sidebar = sidebarRef.current;
      if (!container || !sidebar) return;

      const topOffset = 120; 
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top + window.scrollY;
      const sidebarHeight = sidebar.offsetHeight;
      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.offsetTop : (containerTop + container.offsetHeight);
      
      const stopAt = footerTop - 80; 
      const maxTop = stopAt - sidebarHeight;

      if (currentScroll + topOffset + sidebarHeight >= stopAt) {
        setSidebarStyle({
          position: 'absolute',
          top: maxTop - containerTop,
          left: 0,
          width: sidebar.parentElement?.offsetWidth || 288,
        });
      } else if (currentScroll + topOffset >= containerTop) {
        setSidebarStyle({
          position: 'fixed',
          top: topOffset,
          left: containerRect.left + 16,
          width: sidebar.parentElement?.offsetWidth || 288,
        });
      } else {
        setSidebarStyle({
          position: 'absolute',
          top: 0,
          left: 0,
          width: sidebar.parentElement?.offsetWidth || 288,
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

  const querySummary = [
    location || t({ id: 'Semua lokasi', en: 'All locations' }),
    dateRange[0] && dateRange[1]
      ? `${dateRange[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${dateRange[1].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
      : t({ id: 'Tanggal fleksibel', en: 'Flexible dates' }),
    guests
      ? `${guests} ${t({ id: 'tamu', en: 'guests' })}`
      : t({ id: 'Jumlah tamu fleksibel', en: 'Flexible guests' }),
  ].join(' • ');

  const quickFilters = [
    {
      id: 'pet',
      active: filters.pet_friendly === 'true',
      label: t({ id: 'Pet Friendly', en: 'Pet Friendly' }),
      onToggle: () => handleFilterChange('pet_friendly', filters.pet_friendly === 'true' ? '' : 'true'),
    },
    {
      id: 'wifi',
      active: filters.has_wifi === 'true',
      label: 'WiFi',
      onToggle: () => handleFilterChange('has_wifi', filters.has_wifi === 'true' ? '' : 'true'),
    },
    {
      id: 'private_bathroom',
      active: filters.bathroom_type === 'private',
      label: t({ id: 'Kamar mandi private', en: 'Private bathroom' }),
      onToggle: () => handleFilterChange('bathroom_type', filters.bathroom_type === 'private' ? '' : 'private'),
    },
    {
      id: 'under_1m',
      active: filters.max_price === '1000000',
      label: t({ id: 'Di bawah 1 jt', en: 'Under 1M IDR' }),
      onToggle: () => handleFilterChange('max_price', filters.max_price === '1000000' ? '' : '1000000'),
    },
  ];

  const activeFilterChips = [
    filters.min_price
      ? {
          key: 'min_price',
          label: `Min Rp ${Number(filters.min_price).toLocaleString('id-ID')}`,
          onRemove: () => handleFilterChange('min_price', ''),
        }
      : null,
    filters.max_price
      ? {
          key: 'max_price',
          label: `Max Rp ${Number(filters.max_price).toLocaleString('id-ID')}`,
          onRemove: () => handleFilterChange('max_price', ''),
        }
      : null,
    filters.access_type
      ? {
          key: 'access_type',
          label: `${t({ id: 'Akses', en: 'Access' })}: ${filters.access_type}`,
          onRemove: () => handleFilterChange('access_type', ''),
        }
      : null,
    filters.bathroom_type
      ? {
          key: 'bathroom_type',
          label: `${t({ id: 'Kamar Mandi', en: 'Bathroom' })}: ${filters.bathroom_type}`,
          onRemove: () => handleFilterChange('bathroom_type', ''),
        }
      : null,
    filters.pet_friendly === 'true'
      ? {
          key: 'pet_friendly',
          label: t({ id: 'Pet Friendly', en: 'Pet Friendly' }),
          onRemove: () => handleFilterChange('pet_friendly', ''),
        }
      : null,
    filters.has_wifi === 'true'
      ? {
          key: 'has_wifi',
          label: 'WiFi',
          onRemove: () => handleFilterChange('has_wifi', ''),
        }
      : null,
    filters.has_electricity === 'true'
      ? {
          key: 'has_electricity',
          label: t({ id: 'Listrik', en: 'Electricity' }),
          onRemove: () => handleFilterChange('has_electricity', ''),
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  const displayedResults = useMemo(() => {
    const sorted = [...results];
    if (sortBy === 'price_low') {
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (sortBy === 'price_high') {
      return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    if (sortBy === 'rating_high') {
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  }, [results, sortBy]);

  const maxPriceValue = Number(filters.max_price || 5000000);

  return (
    <div ref={containerRef} className="container mx-auto px-4 py-8 pb-32 lg:pb-8">
      
      {/* 1. DESKTOP SEARCH BAR (Centered above cards) */}

      {/* 2. MOBILE FLOATING BUTTON (Airbnb Style) */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[140] w-[calc(100%-2rem)] max-w-[280px]">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsSearchOpen(true)}
          className="w-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-full py-2.5 px-3.5 flex items-center justify-between border border-black/5 transition-all ring-1 ring-black/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <Search className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-black text-primary leading-none mb-0.5">{location || t({ id: 'Mulai pencarian', en: 'Start searching' })}</span>
              <span className="text-[8px] font-bold text-primary/40 uppercase tracking-widest">
                {formatDateLabel()} • {guests || 1} {t({ id: 'Tamu', en: 'Guests' })}
              </span>
            </div>
          </div>
          <div className="p-2 rounded-full bg-primary/5 text-primary/40">
            <Filter className="w-3 h-3" />
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

      <div className="flex flex-col lg:flex-row gap-10">
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
                <div className="rounded-xl border border-primary/10 bg-white/70 px-3 py-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">
                    <span>{t({ id: 'Maksimal', en: 'Max' })}</span>
                    <span>Rp {maxPriceValue.toLocaleString('id-ID')}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5000000}
                    step={100000}
                    value={maxPriceValue}
                    onChange={(e) => handleFilterChange('max_price', e.target.value)}
                    className="w-full accent-primary"
                  />
                </div>
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
                <label className="flex items-center gap-3 rounded-xl border border-primary/10 bg-white/70 px-3 py-2 hover:bg-primary/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.pet_friendly === 'true'}
                    onChange={(e) => handleFilterChange('pet_friendly', e.target.checked ? 'true' : '')}
                  />
                  <PawPrint className="w-4 h-4 text-accent" />
                  {t({ id: 'Pet Friendly', en: 'Pet Friendly' })}
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-primary/10 bg-white/70 px-3 py-2 hover:bg-primary/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.has_wifi === 'true'}
                    onChange={(e) => handleFilterChange('has_wifi', e.target.checked ? 'true' : '')}
                  />
                  <Wifi className="w-4 h-4 text-accent" />
                  {t({ id: 'WiFi', en: 'WiFi' })}
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-primary/10 bg-white/70 px-3 py-2 hover:bg-primary/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.has_electricity === 'true'}
                    onChange={(e) => handleFilterChange('has_electricity', e.target.checked ? 'true' : '')}
                  />
                  <Zap className="w-4 h-4 text-accent" />
                  {t({ id: 'Listrik', en: 'Electricity' })}
                </label>
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={handleSearch}>{t({ id: 'Terapkan Filter', en: 'Apply Filter' })}</Button>
            </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1 w-full">
          <div className="hidden lg:block mb-8">
            <div className={cn(
              "bg-white/85 backdrop-blur-2xl rounded-[2.5rem] border border-white/40 shadow-xl mx-auto flex transition-all duration-500 ring-1 ring-black/5",
              "max-w-4xl p-2.5"
            )}>
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
          <div className="mb-10 flex flex-col gap-2">
            <h1 className="text-4xl font-black text-primary tracking-tighter">{t({ id: 'Pilihan Escape Tersedia', en: 'Available Escapes' })}</h1>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">
               {isLoading 
                 ? t({ id: 'Memindai alam liar...', en: 'Scanning wildness...' }) 
                 : t({ id: `${data?.meta?.total || 0} tempat ditemukan`, en: `${data?.meta?.total || 0} sanctuaries found` })}
            </p>
          </div>

          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {quickFilters.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onToggle}
                  className={cn(
                    'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors',
                    item.active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-primary/15 bg-white text-primary/70 hover:bg-primary/5'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-primary/10 bg-white/75 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">{querySummary}</p>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                  {t({ id: 'Urutkan', en: 'Sort' })}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price_low' | 'price_high' | 'rating_high')}
                  className="h-9 rounded-full border border-primary/15 bg-white px-3 text-[10px] font-black uppercase tracking-widest text-primary"
                >
                  <option value="relevance">{t({ id: 'Paling Relevan', en: 'Most Relevant' })}</option>
                  <option value="rating_high">{t({ id: 'Rating Tertinggi', en: 'Top Rated' })}</option>
                  <option value="price_low">{t({ id: 'Harga Terendah', en: 'Lowest Price' })}</option>
                  <option value="price_high">{t({ id: 'Harga Tertinggi', en: 'Highest Price' })}</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading && results.length === 0 ? (
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
          ) : results.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 md:py-32 glass rounded-[4rem] border-white/40 shadow-xl overflow-hidden relative"
            >
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,103,74,0.03),transparent_70%)] pointer-events-none" />
               <motion.div 
                 animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                 transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                 className="w-24 h-24 rounded-[2rem] bg-accent/10 flex items-center justify-center mx-auto mb-8 shadow-[0_20px_40px_rgba(212,180,131,0.1)] border border-accent/20"
               >
                 <Compass className="w-12 h-12 text-accent" />
               </motion.div>
               <h3 className="font-display text-2xl font-bold text-primary tracking-tight mb-2">
                 {t({ id: 'Petualangan Baru Menunggu', en: 'A New Adventure Awaits' })}
               </h3>
               <p className="font-black uppercase tracking-[0.25em] text-[10px] text-primary/40 max-w-xs mx-auto leading-relaxed">
                 {t({ id: 'Kami tidak menemukan tempat yang sesuai kriteria pencarianmu.', en: 'We couldn\'t find any sanctuaries matching your current filters.' })}
               </p>
               <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button
                   onClick={handleResetFilters}
                   className="rounded-full h-12 px-8 bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                 >
                   {t({ id: 'Reset Semua Filter', en: 'Reset All Filters' })}
                 </Button>
                 <Button
                   variant="ghost"
                   className="rounded-full h-12 px-8 font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5 transition-all"
                   onClick={() => setLocation('')}
                 >
                   {t({ id: 'Hapus Lokasi', en: 'Clear Location' })}
                 </Button>
               </div>
            </motion.div>

          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-8 w-full">
              {activeFilterChips.length > 0 && (
                <div className="col-span-full -mt-2 mb-2 flex flex-wrap items-center gap-2">
                  {activeFilterChips.map((chip) => (
                    <button
                      key={chip.key}
                      onClick={chip.onRemove}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/15 transition-colors"
                    >
                      {chip.label}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-colors"
                  >
                    {t({ id: 'Reset', en: 'Reset' })}
                  </button>
                </div>
              )}
              {displayedResults.map((glamping) => {
                const storageBase = (process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage/').replace(/\/+$/, '/') ;
                const imageUrl = glamping.thumbnail?.startsWith('http') 
                    ? glamping.thumbnail 
                    : glamping.thumbnail 
                        ? `${storageBase}${glamping.thumbnail.replace(/^\/+/, '')}`
                        : 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80';
                const detailHref = searchParams.toString()
                  ? `/glamping/${glamping.slug}?${searchParams.toString()}`
                  : `/glamping/${glamping.slug}`;
                const isSaved = savedSlugs.includes(glamping.slug);
                const reviewCountCandidate = (glamping as { review_count?: unknown }).review_count;
                const reviewCount = typeof reviewCountCandidate === 'number' ? reviewCountCandidate : undefined;
                const imageCount = glamping.images?.length;
                const highlight =
                  glamping.rating >= 4.8
                    ? t({ id: 'Best Choice', en: 'Best Choice' })
                    : glamping.rating >= 4.6
                      ? t({ id: 'Popular', en: 'Popular' })
                      : null;
                const discount =
                  glamping.price && glamping.price < 800000
                    ? t({ id: 'Discount', en: 'Discount' })
                    : null;
                const locationCityCandidate = (glamping as { location_city?: unknown }).location_city;
                const locationLabel = typeof locationCityCandidate === 'string' ? locationCityCandidate : glamping.location;
                const emotional =
                  glamping.vibe
                    ? `${t({ id: 'Cocok untuk', en: 'Perfect for' })} ${glamping.vibe}`
                    : t({ id: 'Weekend getaway favorit', en: 'A favorite weekend getaway' });

                return (
                    <Link href={detailHref} key={glamping.id} className="group block">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                      className="relative glass rounded-[2.5rem] border-white/40 overflow-hidden shadow-sm transition-all duration-500 h-full flex flex-col group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:shadow-black/20 group-hover:scale-[1.02]"
                    >
                        <div className="p-3 pb-0">
                            <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-gray-100">
                            <Image
                                src={imageUrl} 
                                alt={glamping.name}
                                fill
                                placeholder="blur"
                                blurDataURL={blurDataURL}
                                className="object-cover group-hover:scale-[1.12] transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                              <div className="px-4 py-2 rounded-full bg-white/90 text-primary text-[10px] font-black uppercase tracking-widest shadow-xl">
                                {t({ id: 'View Details', en: 'View Details' })}
                              </div>
                            </div>
                            <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                              <Badge className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full">
                                <Star className="w-3 h-3 fill-accent text-accent mr-1" />
                                {glamping.rating}
                              </Badge>
                              {discount && (
                                <div className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full">
                                  {discount}
                                </div>
                              )}
                              {imageCount && imageCount > 1 && (
                                <div className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full flex items-center gap-1">
                                  <Images className="w-3 h-3" />
                                  {imageCount}
                                </div>
                              )}
                            </div>
                            {highlight && (
                              <div className="absolute bottom-4 right-4 glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full">
                                {highlight}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSave(glamping.slug);
                              }}
                              className={`absolute top-4 left-4 w-10 h-10 rounded-full backdrop-blur-md border border-white/30 flex items-center justify-center transition-all ${
                                isSaved ? 'bg-primary text-primary-foreground scale-105 shadow-lg shadow-primary/30' : 'bg-white/70 text-primary/60 hover:text-primary hover:scale-105'
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
                        <div className="p-6 pt-4 flex flex-col flex-1 min-h-[220px]">
                            <h3 className="font-black text-xl text-primary tracking-tight line-clamp-1 group-hover:text-accent transition-colors">{glamping.name}</h3>
                            <div className="flex items-center gap-1.5 text-primary/50 text-[10px] font-black uppercase tracking-widest mt-2">
                                <MapPin className="w-3 h-3" />
                                {locationLabel}
                            </div>
                            <div className="mt-2 text-xs font-bold text-primary/50 uppercase tracking-widest min-h-[16px]">
                              {emotional}
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
                              <Star className="w-3 h-3 fill-accent text-accent" />
                              {glamping.rating}
                              {typeof reviewCount === 'number' && (
                                <span className="text-primary/30">({reviewCount} {t({ id: 'ulasan', en: 'reviews' })})</span>
                              )}
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
                            <div className="mt-auto pt-7 border-t border-primary/10 flex items-end justify-between gap-3">
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary/30">{t({ id: 'Mulai dari', en: 'From' })}</div>
                                <div className="text-2xl font-black text-primary group-hover:text-accent transition-colors">
                                    <span className="text-sm font-bold mr-1 italic text-primary/30">Rp</span>
                                    {(glamping.price || 0).toLocaleString('id-ID')}
                                    <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-primary/40">/ {t({ id: 'malam', en: 'night' })}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    </Link>
                );
              })}
            </div>
          )}
          {data?.meta && data.meta.current_page < data.meta.last_page && (
            <div className="flex justify-center mt-10">
              <Button
                className="h-12 rounded-full px-8 bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
              >
                {isLoading ? t({ id: 'Memuat...', en: 'Loading...' }) : t({ id: 'Muat lebih banyak', en: 'Load more' })}
              </Button>
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
