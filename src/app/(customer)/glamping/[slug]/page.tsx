'use client';

import { Suspense, useState, use, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Wifi, Flame, Users, Bed, CheckCircle } from 'lucide-react';
import { useGlampingDetail } from '@/hooks/useGlampingDetail';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Unit } from '@/types/glamping';

// Icon mapper helper
const IconMap: Record<string, any> = {
  wifi: Wifi,
  fire: Flame,
  // Add more as needed
};

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80';

function GlampingDetailContent({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { data: glamping, isLoading, isError } = useGlampingDetail(params.slug);
  const sanctuariesRef = useRef<HTMLDivElement>(null);
  
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [dates, setDates] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dates;

  if (isLoading) return <div className="container mx-auto p-8"><Skeleton className="h-[400px] w-full rounded-xl" /></div>;
  if (isError || !glamping) return <div className="container mx-auto p-8 text-center">Glamping not found</div>;

  const handleBook = (unit: Unit) => {
    if (!startDate || !endDate) {
        toast.error("Please select stay dates first!");
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
        toast.info("Please select a sanctuary first");
        sanctuariesRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    handleBook(selectedUnit);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Header & Gallery */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div className="space-y-2">
                <div className="inline-flex glass px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary/60">
                    {glamping.vibe} Stay
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{glamping.name}</h1>
                <div className="flex items-center gap-4 text-primary/50 font-bold text-sm">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{glamping.location_city}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="font-black text-primary">{glamping.rating}</span>
                        <span className="opacity-60">({glamping.review_count} reviews)</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" className="rounded-full px-6">Share</Button>
                <Button variant="outline" className="rounded-full px-6">Save</Button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px] rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="md:col-span-2 relative h-full bg-gray-200">
                <Image 
                    src={glamping.thumbnail_url || PLACEHOLDER_IMAGE} 
                    alt={glamping.name} 
                    fill 
                    className="object-cover hover:scale-105 transition-transform duration-700" 
                />
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {glamping.gallery.slice(0, 4).map((photo, index) => (
                    <div key={index} className="relative h-full bg-gray-200">
                         <Image 
                            src={photo.url || PLACEHOLDER_IMAGE} 
                            alt={photo.caption || glamping.name} 
                            fill 
                            className="object-cover hover:scale-110 transition-transform duration-700" 
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
            <section className="glass-card">
                <h2 className="text-2xl font-black mb-6 text-primary tracking-tight">About this escape</h2>
                <p className="text-primary/70 leading-relaxed font-medium text-lg italic underline decoration-accent/10 underline-offset-8">
                    &quot;{glamping.description}&quot;
                </p>
            </section>

            <section>
                <h2 className="text-2xl font-black mb-8 text-primary tracking-tight">Curated Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {glamping.amenities?.map((amenity: any, idx) => {
                        const name = typeof amenity === 'string' ? amenity : amenity.name;
                        const iconName = typeof amenity === 'string' ? amenity.toLowerCase() : amenity.icon;
                        const Icon = IconMap[iconName] || CheckCircle;
                        return (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-black/5 hover:border-accent/30 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                    <Icon size={20} />
                                </div>
                                <span className="text-sm font-black text-primary/70 uppercase tracking-widest">{name}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

             <section ref={sanctuariesRef}>
                <h2 className="text-2xl font-black mb-8 text-primary tracking-tight">Available Sanctuaries</h2>
                <div className="space-y-6">
                    {glamping.units.map((unit) => (
                        <div key={unit.id} className={`group cursor-pointer transition-all rounded-[2.5rem] bg-white border border-black/5 overflow-hidden hover:shadow-2xl ${selectedUnit?.id === unit.id ? 'ring-4 ring-accent border-transparent' : ''}`} onClick={() => setSelectedUnit(unit)}>
                            <div className="flex flex-col md:flex-row">
                                <div className="relative w-full md:w-64 h-64 md:h-auto bg-gray-200 overflow-hidden">
                                     <Image 
                                        src={(unit.photos && unit.photos.length > 0) ? unit.photos[0] : (glamping.thumbnail_url || PLACEHOLDER_IMAGE)} 
                                        alt={unit.name} 
                                        fill 
                                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                    />
                                </div>
                                <div className="flex-1 p-8 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-black text-2xl text-primary tracking-tight group-hover:text-accent transition-colors">{unit.name}</h3>
                                                <p className="text-sm text-primary/40 font-bold mt-1 line-clamp-2">{unit.description || 'Experience ultimate comfort in nature.'}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-primary">
                                                    <span className="text-sm font-bold mr-1 italic text-primary/30">Rp</span>
                                                    {unit.price_per_night.toLocaleString('id-ID')}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Per Night</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-6 mt-6">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/60"><Users className="w-4 h-4 text-accent" /> {unit.capacity} Guests</div>
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/60"><Bed className="w-4 h-4 text-accent" /> Premium Bedding</div>
                                        </div>
                                    </div>
                                    <div className="mt-8 flex justify-between items-center">
                                         <Badge variant={unit.available_stock > 0 ? "outline" : "destructive"} className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                                            {unit.available_stock > 0 ? `${unit.available_stock} slots left` : "Fully Booked"}
                                         </Badge>
                                         <Button variant={selectedUnit?.id === unit.id ? "default" : "outline"} className="rounded-full">
                                            {selectedUnit?.id === unit.id ? "Selected" : "Select Sanctuary"}
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
        <div className="relative z-10">
            <div className="sticky top-32 glass rounded-[3rem] p-10 border-white/40 shadow-2xl space-y-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
                <div className="relative space-y-2">
                    {selectedUnit ? (
                        <>
                            <div className="text-4xl font-black text-primary">
                                <span className="text-lg font-bold mr-1 italic text-primary/30">Rp</span>
                                {selectedUnit.price_per_night.toLocaleString('id-ID')}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Guaranteed Best Rate</p>
                        </>
                    ) : (
                        <div className="text-2xl font-black text-primary tracking-tight">Reserve Sanctuary</div>
                    )}
                </div>

                <div className="relative space-y-4 z-50">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-primary/10 shadow-sm flex flex-col md:flex-row items-stretch">
                         <CustomDatePicker 
                            startDate={startDate}
                            endDate={endDate}
                            onChange={setDates}
                            className="w-full"
                         />
                    </div>
                    
                    {selectedUnit && (
                         <div className="bg-primary/5 p-5 rounded-2xl border border-primary/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-1">Selected Sanctuary</p>
                            <p className="font-black text-primary">{selectedUnit.name}</p>
                            <p className="text-xs font-bold text-primary/40">Fits {selectedUnit.capacity} explorers</p>
                         </div>
                    )}
                </div>

                <Button 
                    className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-[1.02] transition-all shadow-2xl shadow-primary/30" 
                    onClick={onReserveClick}
                >
                    {!selectedUnit ? 'Choose Sanctuary' : 'Reserve Escape'}
                </Button>
                
                <p className="text-center text-[10px] font-bold text-primary/30 uppercase tracking-widest">No commitment required yet</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function GlampingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using `use` (Next.js 15+ standard for async params)
  const resolvedParams = use(params);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GlampingDetailContent params={resolvedParams} />
    </Suspense>
  );
}
