'use client';

import { Suspense, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Star, Wifi, Flame, Users, Bed, CheckCircle } from 'lucide-react';
import { useGlampingDetail } from '@/hooks/useGlampingDetail';
import { Button } from '@/components/ui/button';
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

function GlampingDetailContent({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { data: glamping, isLoading, isError } = useGlampingDetail(params.slug);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  if (isLoading) return <div className="container mx-auto p-8"><Skeleton className="h-[400px] w-full rounded-xl" /></div>;
  if (isError || !glamping) return <div className="container mx-auto p-8 text-center">Glamping not found</div>;

  const handleBook = (unit: Unit) => {
    // In a real app, we would pass state via context or query params
    // For now, let's just push to booking with query params
    const searchParams = new URLSearchParams({
        glamping_id: glamping.id.toString(),
        unit_id: unit.id.toString(),
        unit_name: unit.name,
        price: unit.price_per_night.toString(),
    });
    router.push(`/booking?${searchParams.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header & Gallery */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{glamping.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{glamping.location_city}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-black">{glamping.rating}</span>
                        <span>({glamping.review_count} reviews)</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px] rounded-xl overflow-hidden">
            <div className="relative h-full bg-gray-200">
                <Image 
                    src={glamping.thumbnail_url} 
                    alt={glamping.name} 
                    fill 
                    className="object-cover" 
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                {glamping.gallery.slice(0, 4).map((photo, index) => (
                    <div key={index} className="relative h-full bg-gray-200">
                         <Image 
                            src={photo.url} 
                            alt={photo.caption} 
                            fill 
                            className="object-cover" 
                        />
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
            <section>
                <h2 className="text-xl font-bold mb-4">About this place</h2>
                <p className="text-gray-600 leading-relaxed">{glamping.description}</p>
            </section>

            <Separator />

            <section>
                <h2 className="text-xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 gap-4">
                    {glamping.amenities.map((amenity, idx) => {
                        const Icon = IconMap[amenity.icon] || CheckCircle;
                        return (
                            <div key={idx} className="flex items-center gap-3 text-gray-600">
                                <Icon className="w-5 h-5" />
                                <span>{amenity.name}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

             <Separator />

             <section>
                <h2 className="text-xl font-bold mb-4">Available Units</h2>
                <div className="space-y-4">
                    {glamping.units.map((unit) => (
                        <Card key={unit.id} className={`cursor-pointer transition-all ${selectedUnit?.id === unit.id ? 'ring-2 ring-primary border-primary' : 'hover:border-gray-400'}`} onClick={() => setSelectedUnit(unit)}>
                            <div className="flex flex-col md:flex-row">
                                <div className="relative w-full md:w-48 h-48 md:h-auto bg-gray-200">
                                     <Image 
                                        src={unit.photos[0] || glamping.thumbnail_url} 
                                        alt={unit.name} 
                                        fill 
                                        className="object-cover" 
                                    />
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg">{unit.name}</h3>
                                            <div className="text-right">
                                                <span className="block text-lg font-bold text-primary">Rp {unit.price_per_night.toLocaleString('id-ID')}</span>
                                                <span className="text-xs text-gray-500">per night</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                            <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {unit.capacity} Guests</div>
                                            <div className="flex items-center gap-1"><Bed className="w-4 h-4" /> 1 King Bed</div>
                                        </div>
                                        <div className="mt-4">
                                             <Badge variant={unit.available_stock > 0 ? "outline" : "destructive"}>
                                                {unit.available_stock > 0 ? `${unit.available_stock} units left` : "Sold Out"}
                                             </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
             </section>
        </div>

        {/* Sidebar Booking Widget */}
        <div className="relative">
            <Card className="sticky top-24 shadow-lg border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>
                            {selectedUnit ? (
                                <>
                                    <span className="text-2xl font-bold">Rp {selectedUnit.price_per_night.toLocaleString('id-ID')}</span>
                                    <span className="text-sm font-normal text-gray-500"> /night</span>
                                </>
                            ) : (
                                <span className="text-lg">Select a unit</span>
                            )}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                             <div className="border rounded-lg p-3">
                                <div className="text-xs font-bold uppercase text-gray-500">Check-in</div>
                                <div className="text-sm">Add date</div>
                             </div>
                             <div className="border rounded-lg p-3">
                                <div className="text-xs font-bold uppercase text-gray-500">Check-out</div>
                                <div className="text-sm">Add date</div>
                             </div>
                        </div>
                        
                        {selectedUnit && (
                             <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                <p className="font-medium">{selectedUnit.name}</p>
                                <p className="text-gray-500">Max {selectedUnit.capacity} Guests</p>
                             </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full text-lg h-12" 
                        disabled={!selectedUnit || selectedUnit.available_stock === 0}
                        onClick={() => selectedUnit && handleBook(selectedUnit)}
                    >
                        {!selectedUnit ? 'Choose a Unit' : 'Reserve'}
                    </Button>
                </CardFooter>
            </Card>
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
