'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n/I18nProvider';
import api from '@/lib/axios';
import { GlampingDetail } from '@/types/glamping';
import { toast } from 'sonner';

const STORAGE_KEY = 'saved_glampings';
const PRICE_HISTORY_KEY = 'wishlist_price_history';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80';

export default function WishlistPage() {
  const { t } = useI18n();
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAnIGhlaWdodD0nMjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzMwJyBoZWlnaHQ9JzIyJyBmaWxsPSIjZWRlN2RlIi8+PC9zdmc+";
  const [slugs, setSlugs] = useState<string[]>([]);
  const [items, setItems] = useState<GlampingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [locationFilter, setLocationFilter] = useState('');
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);
  const [pulseSlug, setPulseSlug] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setSlugs(parsed);
    } catch {
      setSlugs([]);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchWishlist = async () => {
      if (slugs.length === 0) {
        setItems([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const results = await Promise.allSettled(
          slugs.map((slug) => api.get(`/glampings/${slug}`))
        );
        const data = results
          .filter((res): res is PromiseFulfilledResult<any> => res.status === 'fulfilled')
          .map((res) => res.value.data?.data as GlampingDetail)
          .filter(Boolean);
        if (active) setItems(data);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchWishlist();
    return () => {
      active = false;
    };
  }, [slugs]);

  const removeFromWishlist = (slug: string) => {
    setRemovingSlug(slug);
    setTimeout(() => {
      const next = slugs.filter((s) => s !== slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSlugs(next);
      setItems((prev) => prev.filter((item) => item.slug !== slug));
      setRemovingSlug(null);
      toast.success(t({ id: 'Dihapus dari wishlist', en: 'Removed from wishlist' }));
    }, 220);
  };

  const priceHistory = useMemo(() => {
    try {
      const raw = localStorage.getItem(PRICE_HISTORY_KEY);
      return raw ? (JSON.parse(raw) as Record<string, number>) : {};
    } catch {
      return {};
    }
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const next: Record<string, number> = { ...priceHistory };
    let changed = false;
    items.forEach((item) => {
      const key = item.slug;
      if (!next[key] || (item.price || 0) < next[key]) {
        next[key] = item.price || 0;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(next));
    }
  }, [items, priceHistory]);

  const locations = useMemo(() => {
    const values = items
      .map((g) => g.location_city || g.location)
      .filter(Boolean) as string[];
    return Array.from(new Set(values)).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const list = locationFilter
      ? items.filter((g) => (g.location_city || g.location) === locationFilter)
      : items;
    const sorted = [...list];
    if (sortBy === 'price_low') {
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_high') {
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    return sorted;
  }, [items, locationFilter, sortBy]);

  const cheapestId = useMemo(() => {
    if (filteredItems.length === 0) return null;
    return filteredItems.reduce((min, cur) => (cur.price || 0) < (min.price || 0) ? cur : min).id;
  }, [filteredItems]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <Heart className="w-3 h-3" />
            {t({ id: 'Wishlist', en: 'Wishlist' })}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tighter">
            {t({ id: 'Your Dream Escapes', en: 'Your Dream Escapes' })}
          </h1>
          <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">
            {t({ id: 'Places waiting for your next trip', en: 'Places waiting for your next trip' })}
          </p>
        </div>
        <Button asChild className="rounded-full px-6 font-black uppercase tracking-widest text-xs">
          <Link href="/search">{t({ id: 'Jelajahi Lagi', en: 'Explore More' })}</Link>
        </Button>
      </div>

      {!isLoading && items.length > 0 && (
        <div className="flex flex-col md:flex-row gap-3 md:items-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/70 border border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary/60">
            <ArrowUpDown className="w-3 h-3" /> {t({ id: 'Urutkan', en: 'Sort' })}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-10 rounded-full px-4 bg-white/70 border border-primary/10 text-xs font-black uppercase tracking-widest text-primary"
          >
            <option value="newest">{t({ id: 'Terbaru', en: 'Newest' })}</option>
            <option value="price_low">{t({ id: 'Harga Termurah', en: 'Price: Low to High' })}</option>
            <option value="price_high">{t({ id: 'Harga Termahal', en: 'Price: High to Low' })}</option>
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-10 rounded-full px-4 bg-white/70 border border-primary/10 text-xs font-black uppercase tracking-widest text-primary"
          >
            <option value="">{t({ id: 'Semua Lokasi', en: 'All Locations' })}</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full rounded-[2.5rem]" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-4 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-14 md:py-20 glass rounded-[3rem] border-white/40 text-primary/40">
          <Heart className="w-14 h-14 mx-auto mb-6 opacity-20" />
          <p className="font-black uppercase tracking-[0.2em] text-sm">
            {t({ id: 'Wishlist kamu masih kosong', en: 'Your wishlist is empty' })}
          </p>
          <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mt-3">
            {t({ id: 'Simpan tempat favoritmu dulu', en: 'Save your favorite places first' })}
          </p>
          <Button asChild className="mt-6 rounded-full px-6 font-black uppercase tracking-widest text-xs">
            <Link href="/search">{t({ id: 'Explore Villas', en: 'Explore Villas' })}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((glamping) => {
            const imageUrl = glamping.thumbnail_url || glamping.thumbnail || FALLBACK_IMAGE;
            const locationLabel = glamping.location_city || glamping.location;
            const isCheapest = cheapestId === glamping.id;
            const availabilityHint =
              glamping.rating >= 4.8
                ? t({ id: 'Popular', en: 'Popular' })
                : glamping.rating >= 4.6
                  ? t({ id: 'Available this weekend', en: 'Available this weekend' })
                  : t({ id: 'Almost booked', en: 'Almost booked' });
            const emotional =
              glamping.description
                ? glamping.description.split('.').slice(0, 1).join('.')
                : t({ id: 'Perfect for weekend escape', en: 'Perfect for weekend escape' });
            const minAvailable = Array.isArray(glamping.units)
              ? glamping.units.reduce((min, u) => Math.min(min, u.available_stock ?? min), glamping.units[0]?.available_stock ?? 0)
              : null;
            const lastBest = priceHistory[glamping.slug];
            const priceDrop =
              lastBest && glamping.price && glamping.price < lastBest
                ? Math.round(((lastBest - glamping.price) / lastBest) * 100)
                : 0;
            return (
              <div
                key={glamping.slug}
                className={`group relative glass rounded-[2.5rem] border-white/40 overflow-hidden shadow-sm transition-all duration-500 h-full flex flex-col hover:-translate-y-1 hover:scale-[1.02] ${
                  removingSlug === glamping.slug ? 'opacity-0 translate-y-2' : ''
                }`}
              >
                <Link href={`/glamping/${glamping.slug}`} className="block">
                  <div className="p-3 pb-0">
                    <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={glamping.name}
                        fill
                        placeholder="blur"
                        blurDataURL={blurDataURL}
                        className="object-cover group-hover:scale-[1.12] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 right-4">
                        <div className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          {glamping.rating}
                        </div>
                      </div>
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {isCheapest && (
                          <div className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full">
                            {t({ id: 'Best Price', en: 'Best Price' })}
                          </div>
                        )}
                        {priceDrop >= 5 && (
                          <div className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full">
                            {t({ id: `Price dropped ${priceDrop}%`, en: `Price dropped ${priceDrop}%` })}
                          </div>
                        )}
                        <div className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full">
                          {availabilityHint}
                        </div>
                        {minAvailable === 1 && (
                          <div className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full">
                            {t({ id: 'Only 1 slot left', en: 'Only 1 slot left' })}
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <div className="px-4 py-2 rounded-full bg-white/90 text-primary text-[10px] font-black uppercase tracking-widest shadow-xl">
                          {t({ id: 'View', en: 'View' })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-4 flex flex-col flex-1">
                    <h3 className="font-black text-xl text-primary tracking-tight line-clamp-1 group-hover:text-accent transition-colors">
                      {glamping.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-primary/40 text-[10px] font-black uppercase tracking-widest mt-2">
                      <MapPin className="w-3 h-3" />
                      {locationLabel}
                    </div>
                    <div className="mt-2 text-xs font-bold text-primary/50 uppercase tracking-widest line-clamp-1">
                      {emotional}
                    </div>
                    <div className="mt-auto pt-6 border-t border-primary/5 flex justify-between items-center">
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/30">
                        {t({ id: 'Mulai', en: 'From' })}
                      </div>
                      <div className="text-xl font-black text-primary">
                        <span className="text-sm font-bold mr-1 italic text-primary/30">Rp</span>
                        {(glamping.price || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="m-5 mt-0 flex items-center gap-2">
                  <Button
                    variant="outline"
                    className={`flex-1 rounded-full text-[10px] font-black uppercase tracking-widest ${pulseSlug === glamping.slug ? 'animate-pulse' : ''}`}
                    onClick={() => {
                      setPulseSlug(glamping.slug);
                      setTimeout(() => setPulseSlug(null), 300);
                      removeFromWishlist(glamping.slug);
                    }}
                  >
                    {t({ id: 'Remove', en: 'Remove' })}
                  </Button>
                  <Button
                    asChild
                    className="flex-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                  >
                    <Link href={`/glamping/${glamping.slug}`}>{t({ id: 'Book Now', en: 'Book Now' })}</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
