'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n/I18nProvider';
import api from '@/lib/axios';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80';

interface OwnerInfo {
  id: number;
  name: string;
  avatar?: string | null;
}

interface OwnerProduct {
  id: number;
  slug: string;
  name: string;
  location?: string;
  location_city?: string;
  thumbnail?: string | null;
  price: number;
  rating: number;
}

interface OwnerProductsResponse {
  data: {
    owner: OwnerInfo;
    products: OwnerProduct[];
  };
}

function OwnerProductsContent({ params }: { params: { id: string } }) {
  const { t } = useI18n();
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAnIGhlaWdodD0nMjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzMwJyBoZWlnaHQ9JzIyJyBmaWxsPSIjZWRlN2RlIi8+PC9zdmc+";
  const [owner, setOwner] = useState<OwnerInfo | null>(null);
  const [products, setProducts] = useState<OwnerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const storageBase = (process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage/').replace(/\/+$/, '/');

  const resolveImage = (src?: string | null) => {
    if (!src) return FALLBACK_IMAGE;
    if (src.startsWith('http')) return src;
    let normalized = src.replace(/^\/+/, '');
    if (storageBase.includes('/storage/') && normalized.startsWith('storage/')) {
      normalized = normalized.replace(/^storage\//, '');
    }
    return `${storageBase}${normalized}`;
  };

  useEffect(() => {
    let active = true;

    const fetchOwnerProducts = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const { data } = await api.get<OwnerProductsResponse>(`/owners/${params.id}/products`);
        if (!active) return;
        setOwner(data.data.owner);
        setProducts(data.data.products || []);
      } catch {
        if (!active) return;
        setIsError(true);
        setOwner(null);
        setProducts([]);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchOwnerProducts();
    return () => {
      active = false;
    };
  }, [params.id]);

  const headerSubtitle = useMemo(
    () =>
      t({
        id: 'Daftar glamping milik pemilik ini',
        en: 'All glamping products by this owner',
      }),
    [t]
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-3 mb-8">
          <Skeleton className="h-10 w-72 rounded-full" />
          <Skeleton className="h-5 w-96 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full rounded-[2.5rem]" />
              <Skeleton className="h-4 w-3/4 rounded-full" />
              <Skeleton className="h-4 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !owner) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="font-black text-primary uppercase tracking-widest">
          {t({ id: 'Produk pemilik tidak ditemukan', en: 'Owner products not found' })}
        </p>
        <Button asChild className="mt-6 rounded-full px-6 text-xs font-black uppercase tracking-widest">
          <Link href="/search">{t({ id: 'Kembali ke Pencarian', en: 'Back to Search' })}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-2">
          <Button asChild variant="outline" className="rounded-full px-4 text-[10px] font-black uppercase tracking-widest">
            <Link href="/search">
              <ArrowLeft className="w-3 h-3 mr-1" />
              {t({ id: 'Kembali', en: 'Back' })}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {owner.avatar ? (
              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-primary/15">
                <Image src={resolveImage(owner.avatar)} alt={owner.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
                {owner.name.charAt(0)}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tighter">
              {owner.name}
            </h1>
          </div>
          <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">{headerSubtitle}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-14 md:py-20 glass rounded-[3rem] border-white/40 text-primary/40">
          <p className="font-black uppercase tracking-[0.2em] text-sm">
            {t({ id: 'Belum ada produk', en: 'No products yet' })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const imageUrl = resolveImage(product.thumbnail);
            const locationLabel = product.location_city || product.location || '-';

            return (
              <div
                key={product.id}
                className="group relative glass rounded-[2.5rem] border-white/40 overflow-hidden shadow-sm transition-all duration-500 h-full flex flex-col hover:-translate-y-1 hover:scale-[1.02]"
              >
                <Link href={`/glamping/${product.slug}`} className="block">
                  <div className="p-3 pb-0">
                    <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-gray-100">
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        placeholder="blur"
                        blurDataURL={blurDataURL}
                        className="object-cover group-hover:scale-[1.12] transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4">
                        <div className="glass text-white font-black text-[10px] uppercase tracking-widest border-none px-3 py-1.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-accent text-accent" />
                          {product.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-4 flex flex-col flex-1">
                    <h3 className="font-black text-xl text-primary tracking-tight line-clamp-1 group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-primary/40 text-[10px] font-black uppercase tracking-widest mt-2">
                      <MapPin className="w-3 h-3" />
                      {locationLabel}
                    </div>
                    <div className="mt-auto pt-6 border-t border-primary/5 flex justify-between items-center">
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/30">
                        {t({ id: 'Mulai', en: 'From' })}
                      </div>
                      <div className="text-xl font-black text-primary">
                        <span className="text-sm font-bold mr-1 italic text-primary/30">Rp</span>
                        {(product.price || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OwnerProductsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <OwnerProductsContent params={resolvedParams} />;
}
