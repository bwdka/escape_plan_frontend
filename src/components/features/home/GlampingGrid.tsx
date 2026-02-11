'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaHeart, FaArrowRight } from 'react-icons/fa';
import { Glamping } from '@/types/glamping';
import { toast } from 'sonner';
import { MouseEvent } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface GlampingGridProps {
  title: string;
  glampings: Partial<Glamping>[]; // Using Partial for flexibility with mock data
  viewAllLink?: string;
}

export function GlampingGrid({ title, glampings, viewAllLink = '/search' }: GlampingGridProps) {
  
  const handleWishlist = (e: MouseEvent<HTMLButtonElement>, name: string) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    toast.success(`${name} added to your wishlist!`);
  };

  return (
    <section className="container mx-auto px-4 mt-16">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Link href={viewAllLink} className="text-sm font-semibold flex items-center gap-2 text-primary hover:underline group">
            View all <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {glampings.map((item, idx) => (
            <Link href={`/glamping/${item.slug || 'slug-' + idx}`} key={idx} className="block">
                <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col group cursor-pointer">
                    <div className="px-3 -py-3">
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 rounded-xl">
                            <Image 
                                src={item.thumbnail || `https://images.unsplash.com/photo-${1500000000000 + idx}?auto=format&fit=crop&w=800&q=80`} 
                                alt={item.name || 'Glamping'}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                {idx === 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">New</span>}
                                {idx === 2 && <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg uppercase tracking-wider">Top Rated</span>}
                            </div>
                            
                            <button 
                                onClick={(e) => handleWishlist(e, item.name || 'Item')}
                                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/60 backdrop-blur-xl backdrop-saturate-150 border border-white/40 hover:bg-white flex items-center justify-center text-gray-700 hover:text-red-500 transition-all shadow-sm z-10"
                            >
                                <FaHeart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <CardContent className="px-4 pb-4 pt-0 flex-1">
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="font-bold text-gray-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                {item.name}
                            </h3>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-50 rounded-lg shrink-0">
                                <FaStar className="text-xs text-yellow-500" />
                                <span className="text-xs font-bold text-yellow-700">{item.rating || 4.8}</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1 font-medium italic">
                            {item.location || 'Indonesia'}
                        </p>
                    </CardContent>

                    <CardFooter className="px-4 pb-4 pt-0">
                        <div className="w-full flex justify-between items-end border-t pt-3 border-gray-50">
                            <div className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Per night</div>
                            <div className="text-lg font-extrabold text-black">
                                Rp {(item.price || 0).toLocaleString('id-ID')}
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        ))}
      </div>
    </section>
  );
}
