'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n/I18nProvider';
import api from '@/lib/axios';
import { GlampingDetail } from '@/types/glamping';
import { toast } from 'sonner';

const STORAGE_KEY = 'saved_glampings';
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80';

export default function WishlistPage() {
  const { t } = useI18n();
  const [slugs, setSlugs] = useState<string[]>([]);
  const [items, setItems] = useState<GlampingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const next = slugs.filter((s) => s !== slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSlugs(next);
    setItems((prev) => prev.filter((item) => item.slug !== slug));
    toast.success(t({ id: 'Dihapus dari wishlist', en: 'Removed from wishlist' }));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
            <Heart className="w-3 h-3" />
            {t({ id: 'Wishlist', en: 'Wishlist' })}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tighter">
            {t({ id: 'Destinasi Tersimpan', en: 'Saved Escapes' })}
          </h1>
          <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">
            {t({ id: 'Semua tempat yang kamu simpan', en: 'All the places you saved' })}
          </p>
        </div>
        <Button asChild className="rounded-full px-6 font-black uppercase tracking-widest text-xs">
          <Link href="/search">{t({ id: 'Jelajahi Lagi', en: 'Explore More' })}</Link>
        </Button>
      </div>

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
      ) : items.length === 0 ? (
        <div className="text-center py-14 md:py-20 glass rounded-[3rem] border-white/40 text-primary/40">
          <Heart className="w-14 h-14 mx-auto mb-6 opacity-20" />
          <p className="font-black uppercase tracking-[0.2em] text-sm">
            {t({ id: 'Wishlist kamu masih kosong', en: 'Your wishlist is empty' })}
          </p>
          <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mt-3">
            {t({ id: 'Simpan tempat favoritmu dulu', en: 'Save your favorite places first' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((glamping) => {
            const imageUrl = glamping.thumbnail_url || glamping.thumbnail || FALLBACK_IMAGE;
            return (
              <div key={glamping.slug} className="group relative glass rounded-[2.5rem] border-white/40 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col">
                <Link href={`/glamping/${glamping.slug}`} className="block">
                  <div className="p-3 pb-0">
                    <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={glamping.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4">
                        <div className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          {glamping.rating}
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
                      {glamping.location_city || glamping.location}
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
                <Button
                  variant="outline"
                  className="m-5 mt-0 rounded-full text-[10px] font-black uppercase tracking-widest"
                  onClick={() => removeFromWishlist(glamping.slug)}
                >
                  {t({ id: 'Hapus', en: 'Remove' })}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
