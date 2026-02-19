'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGlampings } from '@/hooks/useGlampings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Filter, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Component that reads search params
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
  });

  const { data, isLoading, isError } = useGlampings({
    location: filters.location,
    min_price: filters.min_price ? Number(filters.min_price) : undefined,
    max_price: filters.max_price ? Number(filters.max_price) : undefined,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-72 space-y-8">
          <div className="glass p-8 rounded-[2.5rem] border-white/40 shadow-xl space-y-8">
            <div className="flex items-center gap-3 font-black text-xl text-primary tracking-tight">
              <Filter className="w-5 h-5 text-accent" /> Refine
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Location</label>
              <Input 
                placeholder="Where to?" 
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Budget Range</label>
              <div className="flex flex-col gap-3">
                <Input 
                  placeholder="Min Rp" 
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="rounded-xl h-10 px-4"
                />
                <Input 
                  placeholder="Max Rp" 
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="rounded-xl h-10 px-4"
                />
              </div>
            </div>

            <Button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest shadow-lg shadow-primary/20" onClick={applyFilters}>Apply Filter</Button>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          <div className="mb-10 flex flex-col gap-2">
            <h1 className="text-4xl font-black text-primary tracking-tighter">Available Escapes</h1>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">
               {isLoading ? 'Scanning wildness...' : `${data?.meta?.total || 0} sanctuaries found`}
            </p>
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
          ) : isError ? (
            <div className="text-center py-20 glass rounded-[3rem] border-red-100 text-red-600 font-bold">
              Wildness connection lost. Please try again.
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-32 glass rounded-[3.5rem] border-white/40 text-primary/30">
              <Search className="w-16 h-16 mx-auto mb-6 opacity-10" />
              <p className="font-black uppercase tracking-[0.2em] text-sm">No sanctuaries match your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data?.data.map((glamping) => {
                const imageUrl = glamping.thumbnail?.startsWith('http') 
                    ? glamping.thumbnail 
                    : glamping.thumbnail 
                        ? `http://localhost:8000/storage/${glamping.thumbnail}`
                        : 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80';

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
                            </div>
                        </div>
                        <div className="p-6 pt-4 flex flex-col flex-1">
                            <h3 className="font-black text-xl text-primary tracking-tight line-clamp-1 group-hover:text-accent transition-colors">{glamping.name}</h3>
                            <div className="flex items-center gap-1.5 text-primary/40 text-[10px] font-black uppercase tracking-widest mt-2">
                                <MapPin className="w-3 h-3" />
                                {glamping.location}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {glamping.vibe && (
                                    <span className="text-[9px] px-3 py-1 bg-primary/5 text-primary/60 rounded-full uppercase font-black tracking-widest">
                                        {glamping.vibe}
                                    </span>
                                )}
                            </div>
                            <div className="mt-auto pt-6 border-t border-primary/5 flex justify-between items-center">
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary/30">From</div>
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
  return (
    <Suspense fallback={<div className="container mx-auto p-8">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
