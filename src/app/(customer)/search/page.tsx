'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGlampings } from '@/hooks/useGlampings';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Star, Filter, Search } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-semibold text-lg">
              <Filter className="w-5 h-5" /> Filters
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input 
                placeholder="Where to?" 
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Price Range</label>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="Min" 
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <Input 
                  placeholder="Max" 
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full" onClick={applyFilters}>Apply Filters</Button>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Stays in Indonesia</h1>
            <p className="text-gray-500">
               {isLoading ? 'Searching...' : `${data?.meta?.total || 0} glampings found`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 bg-red-50 rounded-xl text-red-600">
              Something went wrong. Please try again later.
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No glampings found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data.map((glamping) => (
                <Link href={`/glamping/${glamping.slug}`} key={glamping.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer border-0 shadow-sm h-full flex flex-col">
                    <div className="relative h-56 w-full bg-gray-200">
                       <Image
                        src={glamping.thumbnail || 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80'} 
                        alt={glamping.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm font-semibold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {glamping.rating}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg leading-tight line-clamp-1">{glamping.name}</h3>
                                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {glamping.location}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 py-2 flex-1">
                        <div className="flex flex-wrap gap-2 mt-2">
                            {glamping.vibe && (
                                <span className="text-[10px] px-2 py-1 bg-gray-100 rounded-full uppercase tracking-wider font-medium text-gray-600">
                                    {glamping.vibe}
                                </span>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-2 border-t bg-gray-50/50">
                        <div className="w-full flex justify-between items-end">
                             <div className="text-xs text-gray-500">Start from</div>
                             <div className="text-lg font-bold text-primary">
                                Rp {(glamping.price || 0).toLocaleString('id-ID')}
                                <span className="text-sm font-normal text-gray-400">/night</span>
                             </div>
                        </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
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
