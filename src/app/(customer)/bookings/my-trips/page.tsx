'use client';

import { useMyTrips } from "@/hooks/useBooking";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Tent, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MyTripsPage() {
  const { data: trips, isLoading } = useMyTrips();

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex flex-col gap-2 mb-12">
            <h1 className="text-4xl font-black text-primary tracking-tighter">My Journeys</h1>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">History of your nature escapes</p>
        </div>

        {isLoading ? (
            <div className="space-y-6">
                {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full rounded-[2.5rem]" />)}
            </div>
        ) : !trips || trips.length === 0 ? (
            <div className="text-center py-24 glass rounded-[3.5rem] border-white/40">
                <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary/20">
                    <Tent size={40} />
                </div>
                <p className="font-black uppercase tracking-[0.2rem] text-primary/30 mb-8 text-sm">No trips booked yet</p>
                <Link href="/search" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    Start Exploring <ArrowRight size={14} />
                </Link>
            </div>
        ) : (
            <div className="space-y-8">
                {trips.map((trip: any) => (
                    <div key={trip.id} className="group relative">
                        <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] rotate-1 group-hover:rotate-0 transition-transform duration-500" />
                        <div className="relative glass rounded-[2.5rem] border-white/40 overflow-hidden group-hover:shadow-2xl transition-all duration-500">
                            <div className="flex flex-col md:flex-row">
                                <div className="relative w-full md:w-64 h-48 md:h-auto bg-gray-100">
                                    <Image 
                                        src={trip.glamping_thumbnail || 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=400&q=80'} 
                                        alt="Glamping"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="flex-1 p-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent mb-1">
                                                <MapPin size={10} /> {trip.unit_name || 'Sanctuary'}
                                            </div>
                                            <h3 className="font-black text-2xl text-primary tracking-tight">{trip.glamping_name || 'Forest Escape'}</h3>
                                        </div>
                                        <Badge className="rounded-full px-4 py-1 font-black uppercase tracking-widest text-[9px] bg-white text-primary border-primary/10">
                                            {trip.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 mt-6">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/30">Stay Period</p>
                                            <div className="flex items-center gap-2 text-sm font-black text-primary">
                                                <Calendar size={14} className="text-accent" />
                                                {trip.check_in}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/30">Total Invested</p>
                                            <p className="text-sm font-black text-primary">Rp {Number(trip.total_price).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <Link href={`/glamping/${trip.id}`} className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors flex items-center gap-2">
                                            View Details <ArrowRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}
