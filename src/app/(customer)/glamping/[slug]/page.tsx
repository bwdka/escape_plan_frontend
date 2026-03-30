'use client';

import { Suspense, useState, use, useRef, useEffect, type CSSProperties } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Users, Bed, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useGlampingBlockedDates, useGlampingDetail, useUnitBlockedDates } from '@/hooks/useGlampingDetail';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Unit } from '@/types/glamping';
import { useI18n } from '@/i18n/I18nProvider';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { AMENITY_ICON_FALLBACK, AMENITY_ICON_MAP } from '@/lib/amenities';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80';

function GlampingDetailContent({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { data: glamping, isLoading, isError } = useGlampingDetail(params.slug);
  const sanctuariesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarWrapRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAnIGhlaWdodD0nMjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzMwJyBoZWlnaHQ9JzIyJyBmaWxsPSIjZWRlN2RlIi8+PC9zdmc+";
  
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [dates, setDates] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dates;
  const [isSaved, setIsSaved] = useState(false);
  const pathname = usePathname();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [sidebarStyle, setSidebarStyle] = useState<CSSProperties>({});
  const { data: blockedDates } = useGlampingBlockedDates(glamping?.id);
  const { data: unitBlockedDates } = useUnitBlockedDates(selectedUnit?.id);
  const bookedDates = selectedUnit?.id 
    ? (unitBlockedDates ?? blockedDates ?? []) 
    : (blockedDates ?? []);

  const policyText = (() => {
    const type = glamping?.cancellation_policy || 'moderate';
    if (type === 'flexible') {
      return t({ id: 'Bebas batal hingga 24 jam sebelum check-in.', en: 'Free cancellation up to 24 hours before check-in.' });
    }
    if (type === 'strict') {
      return t({ id: 'Pembatalan ketat, refund terbatas mendekati hari H.', en: 'Strict cancellation with limited refunds close to arrival.' });
    }
    return t({ id: 'Pembatalan moderat, refund sebagian sebelum check-in.', en: 'Moderate cancellation with partial refunds before check-in.' });
  })();
  const storageBase = (process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage/').replace(/\/+$/, '/');
  const resolveImage = (src?: string) => {
    if (!src) return PLACEHOLDER_IMAGE;
    if (src.startsWith('http')) return src;
    let normalized = src.replace(/^\/+/, '');
    if (storageBase.includes('/storage/') && normalized.startsWith('storage/')) {
      normalized = normalized.replace(/^storage\//, '');
    }
    return `${storageBase}${normalized}`;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saved_glampings');
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      setIsSaved(parsed.includes(params.slug));
    } catch {
      setIsSaved(false);
    }
  }, [params.slug]);

  const galleryImages = [
    resolveImage(glamping?.thumbnail_url || glamping?.thumbnail || glamping?.images?.[0]),
    ...(glamping?.gallery?.map((photo) => resolveImage(photo.url)) || []),
    ...(glamping?.images?.map((img) => resolveImage(img)) || []),
  ].filter(Boolean);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const goPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const goNext = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryImages.length);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isLightboxOpen, galleryImages.length]);

  useEffect(() => {
    const handlePosition = () => {
      if (window.innerWidth < 1024) {
        setSidebarStyle({});
        return;
      }
      const container = containerRef.current;
      const sidebar = sidebarRef.current;
      const sidebarWrap = sidebarWrapRef.current;
      if (!container || !sidebar || !sidebarWrap) return;

      const topOffset = 120;
      const startOffset = 0;
      const paddingX = 0;
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top + window.scrollY;
      const wrapRect = sidebarWrap.getBoundingClientRect();
      const wrapLeft = wrapRect.left + window.scrollX;
      const wrapWidth = wrapRect.width;
      const containerHeight = container.offsetHeight;
      const containerBottom = containerTop + containerHeight;
      const sidebarHeight = sidebar.offsetHeight;
      const maxTop = containerBottom - sidebarHeight;
      const scrollTop = window.scrollY;

      if (scrollTop + topOffset >= maxTop) {
        setSidebarStyle({
          position: 'absolute',
          top: maxTop - containerTop,
          left: 0,
          width: wrapWidth,
        });
      } else if (scrollTop + topOffset >= containerTop) {
        setSidebarStyle({
          position: 'fixed',
          top: topOffset,
          left: wrapLeft + paddingX,
          width: wrapWidth,
        });
      } else {
        setSidebarStyle({
          position: 'absolute',
          top: startOffset,
          left: 0,
          width: wrapWidth,
        });
      }
    };

    const onScroll = () => {
      window.requestAnimationFrame(handlePosition);
    };

    handlePosition();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handlePosition);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handlePosition);
    };
  }, []);

  if (isLoading) return <div className="container mx-auto p-8"><Skeleton className="h-[400px] w-full rounded-xl" /></div>;
  if (isError || !glamping) return <div className="container mx-auto p-8 text-center">{t({ id: 'Glamping tidak ditemukan', en: 'Glamping not found' })}</div>;

  const metaTitle = t({
    id: `Glamping di ${glamping.name} - Booking Sekarang`,
    en: `${glamping.name} Glamping - Book Now`,
  });
  const metaDescription = glamping.description
    ? glamping.description.slice(0, 160)
    : t({ id: 'Temukan pengalaman glamping terbaik dengan fasilitas premium.', en: 'Discover premium glamping experiences with curated amenities.' });

  const handleBook = (unit: Unit) => {
    if (!startDate || !endDate) {
        toast.error(t({ id: 'Pilih tanggal menginap terlebih dahulu!', en: 'Please select stay dates first!' }));
        return;
    }

    const searchParams = new URLSearchParams({
        glamping_id: glamping.id.toString(),
        unit_id: unit.id.toString(),
        unit_name: unit.name,
        price: unit.price_per_night.toString(),
        check_in: startDate.toISOString().split('T')[0],
        check_out: endDate.toISOString().split('T')[0],
    });
    router.push(`/booking?${searchParams.toString()}`);
  };

  const onReserveClick = () => {
    if (!selectedUnit) {
        toast.info(t({ id: 'Pilih tempat terlebih dahulu', en: 'Please select a sanctuary first' }));
        sanctuariesRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    handleBook(selectedUnit);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${pathname}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: glamping.name,
          text: glamping.location_city,
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t({ id: 'Link berhasil disalin!', en: 'Link copied to clipboard!' }));
      }
    } catch {
      toast.error(t({ id: 'Gagal membagikan link', en: 'Failed to share link' }));
    }
  };

  const toggleSave = () => {
    try {
      const raw = localStorage.getItem('saved_glampings');
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      const next = parsed.includes(params.slug)
        ? parsed.filter((slug) => slug !== params.slug)
        : [...parsed, params.slug];
      localStorage.setItem('saved_glampings', JSON.stringify(next));
      const savedNow = next.includes(params.slug);
      setIsSaved(savedNow);
      toast.success(savedNow
        ? t({ id: 'Disimpan ke wishlist', en: 'Saved to wishlist' })
        : t({ id: 'Dihapus dari wishlist', en: 'Removed from wishlist' })
      );
    } catch {
      toast.error(t({ id: 'Gagal menyimpan', en: 'Failed to save' }));
    }
  };

  return (
    <div className="w-full">
        <Head>
          <title>{metaTitle}</title>
          <meta name="description" content={metaDescription} />
        </Head>
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl pb-28 md:pb-12">
        {/* Header & Gallery */}
        <div className="mb-8 md:mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6 md:mb-8">
                <div className="space-y-2">
                    <div className="inline-flex glass px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary/60">
                        {glamping.vibe} {t({ id: 'Menginap', en: 'Stay' })}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tighter leading-tight">{glamping.name}</h1>
                      {isSaved && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary">
                          {t({ id: 'Tersimpan', en: 'Saved' })}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-primary/50 font-bold text-xs md:text-sm">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span>{glamping.location_city}</span>
                        </div>
                        <span className="hidden md:inline">•</span>
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 fill-accent text-accent" />
                            <span className="font-black text-primary">{glamping.rating}</span>
                            <span className="opacity-60">({glamping.review_count} {t({ id: 'ulasan', en: 'reviews' })})</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                    <Button onClick={handleShare} variant="outline" className="flex-1 md:flex-none rounded-full px-6 text-xs font-black uppercase tracking-widest">
                      {t({ id: 'Bagikan', en: 'Share' })}
                    </Button>
                    <Button onClick={toggleSave} variant={isSaved ? "default" : "outline"} className="flex-1 md:flex-none rounded-full px-6 text-xs font-black uppercase tracking-widest">
                      {isSaved ? t({ id: 'Tersimpan', en: 'Saved' }) : t({ id: 'Simpan', en: 'Save' })}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 h-[300px] md:h-[500px] rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl">
                <button
                  type="button"
                  className="md:col-span-2 relative h-full bg-gray-200 cursor-zoom-in"
                  onClick={() => openLightbox(0)}
                >
                    <Image 
                        src={resolveImage(glamping.thumbnail_url)} 
                        alt={glamping.name} 
                        fill 
                        placeholder="blur"
                        blurDataURL={blurDataURL}
                        className="object-cover hover:scale-105 transition-transform duration-700" 
                    />
                </button>
                <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-4">
                    {glamping.gallery.slice(0, 4).map((photo, index) => (
                        <button
                          type="button"
                          key={index}
                          className="relative h-full bg-gray-200 cursor-zoom-in"
                          onClick={() => openLightbox(index + 1)}
                        >
                            <Image 
                                src={resolveImage(photo.url)} 
                                alt={photo.caption || glamping.name} 
                                fill 
                                placeholder="blur"
                                blurDataURL={blurDataURL}
                                className="object-cover hover:scale-110 transition-transform duration-700" 
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile gallery strip */}
            {glamping.gallery.length > 0 && (
              <div className="md:hidden mt-4">
                <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scroll-smooth">
                  {glamping.gallery.slice(0, 8).map((photo, index) => (
                    <button
                      type="button"
                      key={index}
                      className="relative h-28 w-40 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-200 snap-center cursor-zoom-in"
                      onClick={() => openLightbox(index + 1)}
                    >
                      <Image
                        src={resolveImage(photo.url)}
                        alt={photo.caption || glamping.name}
                        fill
                        placeholder="blur"
                        blurDataURL={blurDataURL}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  {glamping.gallery.slice(0, 8).map((_, index) => (
                    <span key={index} className="h-1.5 w-1.5 rounded-full bg-primary/30" />
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Mobile fixed reserve bar */}
        <div className="fixed bottom-4 left-0 right-0 z-40 md:hidden">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center gap-3 pr-14">
              <div className="flex-1">
                <CustomDatePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={setDates}
                  bookedDates={bookedDates}
                  showLabel={false}
                  className="w-full"
                  triggerClassName="w-full flex items-center px-3 py-2 rounded-xl bg-white/80 border border-white/60 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
                />
              </div>
              <Button
                onClick={onReserveClick}
                className="h-11 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
              >
                {t({ id: 'Pilih Unit', en: 'Choose Sanctuary' })}
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent
            showCloseButton={false}
            className="w-screen h-[100svh] max-w-none p-0 border-none rounded-none bg-black/95"
          >
            <DialogTitle className="sr-only">Gallery preview</DialogTitle>
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-4 md:left-8 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-4 md:right-8 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="relative w-full h-full">
                <Image
                  src={galleryImages[lightboxIndex]}
                  alt={`${glamping.name} photo ${lightboxIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs font-black uppercase tracking-widest">
                {lightboxIndex + 1} / {galleryImages.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 md:space-y-12 order-2 lg:order-1">
                <section className="glass-card p-6 md:p-8 rounded-3xl">
                    <h2 className="text-xl md:text-2xl font-black mb-4 md:mb-6 text-primary tracking-tight">{t({ id: 'Tentang Escape Ini', en: 'About this escape' })}</h2>
                    <p className="text-primary/70 leading-relaxed font-medium text-base md:text-lg italic underline decoration-accent/10 underline-offset-8">
                        &quot;{glamping.description}&quot;
                    </p>
                </section>

                <section>
                    <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-primary tracking-tight">{t({ id: 'Fasilitas Pilihan', en: 'Curated Amenities' })}</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6">
                        {glamping.amenities?.map((amenity: any, idx) => {
                            const name = typeof amenity === 'string' ? amenity : amenity.name;
                            const iconName = typeof amenity === 'string'
                              ? amenity.toLowerCase()
                              : (amenity.icon || amenity.name || '').toLowerCase().replace(/\s+/g, '_');
                            const Icon = AMENITY_ICON_MAP[iconName] || AMENITY_ICON_FALLBACK;
                            return (
                                <div key={idx} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border border-black/5 hover:border-accent/30 transition-all group">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform flex-shrink-0">
                                        <Icon size={16} className="md:w-5 md:h-5" />
                                    </div>
                                    <span className="text-[10px] md:text-sm font-black text-primary/70 uppercase tracking-widest line-clamp-1">{name}</span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="rounded-[2rem] bg-white border border-black/5 p-5 md:p-6 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Akses', en: 'Access' })}</p>
                    <p className="text-sm font-bold text-primary">{glamping.access_notes || t({ id: 'Akses mudah, detail mengikuti konfirmasi host.', en: 'Easy access, details confirmed by host.' })}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">{t({ id: 'Tipe Akses', en: 'Access Type' })}: {glamping.access_type}</p>
                  </div>
                  <div className="rounded-[2rem] bg-white border border-black/5 p-5 md:p-6 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Keamanan', en: 'Safety' })}</p>
                    <p className="text-sm font-bold text-primary">{glamping.safety_notes || t({ id: 'Ikuti arahan host dan batas area aman.', en: 'Follow host guidance and safe zone boundaries.' })}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">{t({ id: 'Listrik', en: 'Electricity' })}: {glamping.has_electricity ? t({ id: 'Tersedia', en: 'Available' }) : t({ id: 'Terbatas', en: 'Limited' })}</p>
                  </div>
                  <div className="rounded-[2rem] bg-white border border-black/5 p-5 md:p-6 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Perlengkapan', en: 'Packing List' })}</p>
                    <p className="text-sm font-bold text-primary">{glamping.packing_list || t({ id: 'Bawa jaket hangat, sandal, senter, dan obat pribadi.', en: 'Bring warm jacket, sandals, flashlight, and personal meds.' })}</p>
                  </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-[2rem] bg-white border border-black/5 p-5 md:p-6 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Aturan Rumah', en: 'House Rules' })}</p>
                    <p className="text-sm font-bold text-primary">{glamping.house_rules || t({ id: 'Jaga kebersihan, tidak merusak alam, dan patuhi jam tenang.', en: 'Keep it clean, respect nature, and observe quiet hours.' })}</p>
                  </div>
                  <div className="rounded-[2rem] bg-white border border-black/5 p-5 md:p-6 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Kebijakan Pembatalan', en: 'Cancellation Policy' })}</p>
                    <p className="text-sm font-bold text-primary">{policyText}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">
                      {glamping.reschedule_allowed ? t({ id: 'Reschedule Diizinkan', en: 'Reschedule Allowed' }) : t({ id: 'Reschedule Tidak Diizinkan', en: 'No Reschedule' })}
                    </p>
                  </div>
                </section>

                <section ref={sanctuariesRef}>
                    <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-primary tracking-tight">{t({ id: 'Pilihan Unit Tersedia', en: 'Available Sanctuaries' })}</h2>
                    <div className="space-y-4 md:space-y-6">
                        {glamping.units.map((unit) => (
                            <div key={unit.id} className={`group cursor-pointer transition-all rounded-[1.5rem] md:rounded-[2.5rem] bg-white border border-black/5 overflow-hidden hover:shadow-2xl ${selectedUnit?.id === unit.id ? 'ring-2 md:ring-4 ring-accent border-transparent' : ''}`} onClick={() => setSelectedUnit(unit)}>
                                <div className="flex flex-col md:flex-row">
                                    <div className="relative w-full md:w-64 h-48 md:h-auto bg-gray-200 overflow-hidden">
                                        <Image 
                                            src={resolveImage(
                                              Array.isArray(unit.photos) && unit.photos.length > 0
                                                ? (typeof unit.photos[0] === 'string'
                                                  ? unit.photos[0]
                                                  : (unit.photos[0]?.url || unit.photos[0]?.path))
                                                : (glamping.thumbnail_url || glamping.thumbnail || glamping.images?.[0])
                                            )} 
                                            alt={unit.name} 
                                            fill 
                                            placeholder="blur"
                                            blurDataURL={blurDataURL}
                                            className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    </div>
                                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                        <div>
                                            <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                                                <div>
                                                    <h3 className="font-black text-xl md:text-2xl text-primary tracking-tight group-hover:text-accent transition-colors">{unit.name}</h3>
                                                    <p className="text-xs md:text-sm text-primary/40 font-bold mt-1 line-clamp-2">{unit.description || t({ id: 'Rasakan kenyamanan terbaik di alam.', en: 'Experience ultimate comfort in nature.' })}</p>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <div className="text-xl md:text-2xl font-black text-primary">
                                                        <span className="text-xs md:text-sm font-bold mr-1 italic text-primary/30">Rp</span>
                                                        {unit.price_per_night.toLocaleString('id-ID')}
                                                    </div>
                                                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-primary/30">{t({ id: 'Per Malam', en: 'Per Night' })}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 md:gap-6 mt-4 md:mt-6">
                                                <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-primary/60"><Users className="w-3 h-3 md:w-4 md:h-4 text-accent" /> {unit.capacity} {t({ id: 'Tamu', en: 'Guests' })}</div>
                                                <div className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-primary/60"><Bed className="w-3 h-3 md:w-4 md:h-4 text-accent" /> {t({ id: 'Kasur Premium', en: 'Premium Bedding' })}</div>
                                            </div>
                                        </div>
                                        <div className="mt-6 md:mt-8 flex flex-row items-center justify-between gap-4">
                                            <Badge variant={unit.available_stock > 0 ? "outline" : "destructive"} className="rounded-full px-3 md:px-4 py-1 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                                {unit.available_stock > 0 
                                                  ? t({ id: `${unit.available_stock} slot tersisa`, en: `${unit.available_stock} slots left` }) 
                                                  : t({ id: 'Penuh Terpesan', en: 'Fully Booked' })}
                                            </Badge>
                                            <Button variant={selectedUnit?.id === unit.id ? "default" : "outline"} size="sm" className="rounded-full text-[10px] font-black uppercase tracking-widest px-4 md:px-6">
                                                {selectedUnit?.id === unit.id ? t({ id: 'Dipilih', en: 'Selected' }) : t({ id: 'Pilih', en: 'Select' })}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sidebar Booking Widget */}
            <div ref={sidebarWrapRef} className="relative z-10 order-1 lg:order-2 self-start h-fit">
                <div
                  ref={sidebarRef}
                  style={sidebarStyle}
                  className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 lg:p-10 border-white/40 shadow-2xl space-y-6 md:space-y-8 relative overflow-visible"
                >
                    {/* Decorative Blur - Scoped to prevent document overflow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none overflow-hidden" />
                    
                    <div className="relative space-y-2">
                        {selectedUnit ? (
                            <>
                                <div className="text-3xl md:text-4xl font-black text-primary">
                                    <span className="text-base md:text-lg font-bold mr-1 italic text-primary/30">Rp</span>
                                    {selectedUnit.price_per_night.toLocaleString('id-ID')}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Harga Terbaik Dijamin', en: 'Guaranteed Best Rate' })}</p>
                            </>
                        ) : (
                            <div className="text-xl md:text-2xl font-black text-primary tracking-tight">{t({ id: 'Pesan Unit', en: 'Reserve Sanctuary' })}</div>
                        )}
                    </div>

                    <div className="relative space-y-4 z-[60]">
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-sm">
                            <CustomDatePicker 
                                startDate={startDate}
                                endDate={endDate}
                                onChange={setDates}
                                bookedDates={bookedDates}
                                className="w-full"
                            />
                        </div>
                        
                        {selectedUnit && (
                            <div className="bg-primary/5 p-4 md:p-5 rounded-2xl border border-primary/5">
                                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-1">{t({ id: 'Unit Terpilih', en: 'Selected Sanctuary' })}</p>
                                <p className="font-black text-primary text-sm md:text-base">{selectedUnit.name}</p>
                                <p className="text-[10px] md:text-xs font-bold text-primary/40">{t({ id: `Untuk ${selectedUnit.capacity} tamu`, en: `Fits ${selectedUnit.capacity} explorers` })}</p>
                            </div>
                        )}
                    </div>

                    <Button 
                        className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl text-sm md:text-base font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-[1.02] transition-all shadow-xl md:shadow-2xl shadow-primary/30 active:scale-95" 
                        onClick={onReserveClick}
                    >
                        {!selectedUnit ? t({ id: 'Pilih Unit', en: 'Choose Sanctuary' }) : t({ id: 'Pesan Escape', en: 'Reserve Escape' })}
                    </Button>
                    
                    <p className="text-center text-[8px] md:text-[10px] font-bold text-primary/30 uppercase tracking-widest">{t({ id: 'Belum ada komitmen pembayaran', en: 'No commitment required yet' })}</p>
                </div>
            </div>
        </div>
        </div>
    </div>
  );
}

export default function GlampingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { t } = useI18n();

  return (
    <Suspense fallback={<div>{t({ id: 'Memuat...', en: 'Loading...' })}</div>}>
      <GlampingDetailContent params={resolvedParams} />
    </Suspense>
  );
}
