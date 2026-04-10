'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ArrowRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Glamping } from '@/types/glamping';
import { toast } from 'sonner';
import { MouseEvent, useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

interface GlampingGridProps {
  title: string;
  glampings: Partial<Glamping>[];
  viewAllLink?: string;
}

export function GlampingGrid({ title, glampings, viewAllLink = '/search' }: GlampingGridProps) {
  const { t } = useI18n();
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAnIGhlaWdodD0nMjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzMwJyBoZWlnaHQ9JzIyJyBmaWxsPSIjZWRlN2RlIi8+PC9zdmc+";

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saved_glampings');
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setSavedSlugs(parsed);
    } catch {
      setSavedSlugs([]);
    }
  }, []);
  
  const handleWishlist = (e: MouseEvent<HTMLButtonElement>, name: string, slug?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!slug) {
      toast.error(t({ id: 'Slug tidak ditemukan', en: 'Missing slug' }));
      return;
    }
    try {
      const next = savedSlugs.includes(slug)
        ? savedSlugs.filter((s) => s !== slug)
        : [...savedSlugs, slug];
      localStorage.setItem('saved_glampings', JSON.stringify(next));
      setSavedSlugs(next);
      toast.success(next.includes(slug)
        ? t({ id: `Berhasil menambahkan ${name} ke wishlist!`, en: `${name} added to your wishlist!` })
        : t({ id: `${name} dihapus dari wishlist`, en: `${name} removed from your wishlist` })
      );
    } catch {
      toast.error(t({ id: 'Gagal menyimpan wishlist', en: 'Failed to save wishlist' }));
    }
  };

  return (
    <section className="container mx-auto px-4 mt-24 mb-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-1 w-10 bg-accent rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Curated</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-[-0.02em] text-foreground mb-4">
              {title}
            </h2>
            <div className="h-1.5 w-24 bg-accent rounded-full" />
        </motion.div>
        
        <Link 
          href={viewAllLink} 
          className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
            {t({ id: 'Lihat Semua', en: 'Explore All' })} 
            <span className="p-2 rounded-full bg-accent/10 group-hover:bg-accent group-hover:text-accent-foreground transition-all">
              <ArrowRight className="w-4 h-4" />
            </span>
        </Link>
      </div>
      
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {glampings.map((item, idx) => {
            const imageUrl = item.thumbnail?.startsWith('http') 
                ? item.thumbnail 
                : item.thumbnail 
                    ? `http://localhost:8000/storage/${item.thumbnail}`
                    : `https://images.unsplash.com/photo-${1500000000000 + idx}?auto=format&fit=crop&w=800&q=80`;
            const showPopular = idx % 4 === 1;
            const showLimited = idx % 4 === 2;
            const bookedCount = 18 + (idx % 4) * 6;
            const remaining = 3 + (idx % 3);

            return (
                <motion.div 
                  key={idx} 
                  variants={fadeIn}
                  whileHover={{ y: -10 }}
                  className="group"
                >
                  <Link href={`/glamping/${item.slug || 'slug-' + idx}`} className="block h-full">
                    <div className="relative h-full flex flex-col bg-card rounded-[2.25rem] overflow-hidden border border-black/5 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 hover:scale-[1.02] hover:border-accent/30">
                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.35),transparent_45%)]" />
                        {/* Image Container */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <Image 
                                src={imageUrl} 
                                alt={item.name || 'Glamping'}
                                fill
                                placeholder="blur"
                                blurDataURL={blurDataURL}
                                className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-70" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70" />
                            
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {idx === 0 && (
                                  <span className="glass-dark text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">
                                    {t({ id: 'Pilihan Terbaik', en: 'Best Choice' })}
                                  </span>
                                )}
                                {showPopular && (
                                  <span className="glass-dark text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md inline-flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    {t({ id: 'Favorit', en: 'Popular' })}
                                  </span>
                                )}
                                {showLimited && (
                                  <span className="glass-dark text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">
                                    {t({ id: 'Hampir Penuh', en: 'Limited' })} • {remaining} {t({ id: 'tersisa', en: 'left' })}
                                  </span>
                                )}
                                {item.slug && savedSlugs.includes(item.slug) && (
                                  <span className="glass-dark text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md">
                                    {t({ id: 'Tersimpan', en: 'Saved' })}
                                  </span>
                                )}
                            </div>
                            
                            <button 
                                onClick={(e) => handleWishlist(e, item.name || 'Item', item.slug)}
                                className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md border border-white/30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 ${
                                  item.slug && savedSlugs.includes(item.slug)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-black/40 text-white hover:bg-white hover:text-red-500'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${item.slug && savedSlugs.includes(item.slug) ? 'fill-current' : ''}`} />
                            </button>

                            {/* Price Tag Overlay */}
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                <div className="glass-dark px-4 py-2 rounded-xl backdrop-blur-md">
                                  <span className="text-xs text-white/80 font-medium uppercase tracking-wider block mb-0.5">Start from</span>
                                  <span className="text-white font-bold">
                                    Rp {(item.price || 0).toLocaleString('id-ID')}
                                  </span>
                                </div>
                                <div className="glass-dark px-3 py-2 rounded-xl backdrop-blur-md flex items-center gap-2">
                                  <Star className="w-4 h-4 text-amber-300 fill-current" />
                                  <div className="text-xs font-bold text-white">{item.rating || 4.8}</div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-2">
                                <h3 className="font-display text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-1 text-amber-400 shrink-0">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="text-sm font-bold text-foreground">{item.rating || 4.8}</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <MapPin className="w-3.5 h-3.5" />
                                <p className="text-xs font-bold uppercase tracking-wider truncate">
                                    {item.location || 'Indonesia'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {t({ id: 'Terverifikasi', en: 'Verified' })}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-200">
                                <Sparkles className="w-3.5 h-3.5" />
                                {t({ id: 'Rating Tinggi', en: 'Top Rated' })}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                              <span className="inline-flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {t({ id: 'Booked Hari Ini', en: 'Booked Today' })} {bookedCount}x
                              </span>
                              <span className="text-foreground font-black">
                                {remaining} {t({ id: 'unit tersisa', en: 'units left' })}
                              </span>
                            </div>

                            <div className="pt-4">
                              <div className="flex items-center justify-between text-xs font-bold text-primary opacity-70 group-hover:opacity-100 transition-opacity">
                                <span className="uppercase tracking-[0.25em]">{t({ id: 'Lihat Detail', en: 'View Details' })}</span>
                                <span className="text-primary/60 group-hover:text-primary transition-colors">→</span>
                              </div>
                            </div>
                        </div>
                    </div>
                  </Link>
                </motion.div>
            );
        })}
      </motion.div>
    </section>
  );
}
