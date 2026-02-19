'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaHeart, FaArrowRight } from 'react-icons/fa';
import { MapPin } from 'lucide-react';
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
    <section className="container mx-auto px-4 mt-20">
      <div className="flex justify-between items-end mb-10">
        <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-primary">{title}</h2>
            <div className="h-1 w-12 bg-accent mt-2 rounded-full" />
        </div>
        <Link href={viewAllLink} className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary/60 hover:text-primary transition-all group">
            Explore All <FaArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {glampings.map((item, idx) => {
            const imageUrl = item.thumbnail?.startsWith('http') 
                ? item.thumbnail 
                : item.thumbnail 
                    ? `http://localhost:8000/storage/${item.thumbnail}`
                    : `https://images.unsplash.com/photo-${1500000000000 + idx}?auto=format&fit=crop&w=800&q=80`;

            return (
                <Link href={`/glamping/${item.slug || 'slug-' + idx}`} key={idx} className="block group">
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-black/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                        <div className="p-3 pb-0">
                            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-gray-100">
                                <Image 
                                    src={imageUrl} 
                                    alt={item.name || 'Glamping'}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {idx === 0 && <span className="glass text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">New Arrival</span>}
                                    {idx === 2 && <span className="bg-accent text-accent-foreground text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">Curated</span>}
                                </div>
                                
                                <button 
                                    onClick={(e) => handleWishlist(e, item.name || 'Item')}
                                    className="absolute top-4 right-4 w-10 h-10 rounded-full glass border-white/40 hover:bg-white flex items-center justify-center text-primary hover:text-red-500 transition-all shadow-sm z-10"
                                >
                                    <FaHeart className="w-4 h-4" />
                                </button>

                                {/* Bottom Overlay Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-1">View Details</p>
                                    <div className="h-0.5 w-8 bg-accent" />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start gap-2 mb-3">
                                <h3 className="font-black text-xl text-primary leading-tight line-clamp-1 group-hover:text-accent transition-colors">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-lg shrink-0">
                                    <FaStar className="text-[10px] text-accent" />
                                    <span className="text-[10px] font-black text-primary">{item.rating || 4.8}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-primary/50 mb-6">
                                <MapPin size={12} className="shrink-0" />
                                <p className="text-[11px] font-bold uppercase tracking-wider truncate">
                                    {item.location || 'Indonesia'}
                                </p>
                            </div>

                            <div className="mt-auto pt-4 border-t border-black/5 flex justify-between items-center">
                                <div className="text-[10px] text-primary/40 font-black uppercase tracking-widest">Nightly</div>
                                <div className="text-xl font-black text-primary">
                                    <span className="text-sm font-bold mr-1 italic text-primary/40">Rp</span>
                                    {(item.price || 0).toLocaleString('id-ID')}
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            );
        })}
      </div>
    </section>
  );
}
