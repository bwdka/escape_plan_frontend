'use client';

import { use } from 'react';
import { useBookingDetail } from "@/hooks/useBooking";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Tent, ArrowLeft, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: booking, isLoading, isError } = useBookingDetail(resolvedParams.id);
  const router = useRouter();

  if (isLoading) return (
    <div className="container mx-auto px-4 py-16 max-w-3xl space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full rounded-[3rem]" />
    </div>
  );

  if (isError || !booking) return (
    <div className="container mx-auto px-4 py-32 text-center">
        <p className="text-primary/40 font-black uppercase tracking-widest mb-8">Booking not found</p>
        <Link href="/bookings/my-trips" className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs">
            Back to My Trips
        </Link>
    </div>
  );

  const handlePay = () => {
    if (booking.snap_token && window.snap) {
        window.snap.pay(booking.snap_token, {
            onSuccess: () => {
                toast.success("Pembayaran berhasil!");
                router.refresh();
            },
            onPending: () => {
                toast.info("Menunggu pembayaran...");
            },
            onClose: () => {
                toast.warning("Selesaikan pembayaran sebelum waktu habis!");
            }
        });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Link href="/bookings/my-trips" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors mb-8">
            <ArrowLeft size={12} /> Back to My Trips
        </Link>

        <div className="glass rounded-[3.5rem] border-white/40 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative h-64 bg-gray-100">
                <Image 
                    src={booking.glamping_thumbnail} 
                    alt={booking.glamping_name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-8 left-10 right-8 text-white">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent mb-1">
                        <MapPin size={10} /> {booking.unit_name}
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter">{booking.glamping_name}</h1>
                </div>
                <div className="absolute top-8 right-10">
                    <Badge className="rounded-full px-6 py-2 font-black uppercase tracking-widest text-[10px] bg-white text-primary border-none shadow-xl">
                        {booking.status}
                    </Badge>
                </div>
            </div>

            <div className="p-10 space-y-10">
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Booking ID</p>
                            <p className="font-black text-primary text-lg">{booking.booking_code}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Guest Details</p>
                            <p className="font-black text-primary">{booking.guest_name}</p>
                            <p className="text-xs font-bold text-primary/40">{booking.guest_email}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">Stay Period</p>
                            <div className="flex items-center gap-2 font-black text-primary">
                                <Calendar size={16} className="text-accent" />
                                {booking.check_in} — {booking.check_out}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="opacity-5" />

                {/* Items Breakdown */}
                <div className="space-y-6">
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-primary/40">Order Summary</h3>
                    <div className="space-y-4">
                        {booking.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm font-bold">
                                <span className="text-primary/60">{item.name} x {item.quantity}</span>
                                <span className="text-primary">Rp {Number(item.total_price).toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                        <div className="pt-6 border-t border-primary/5 flex justify-between items-end">
                            <span className="font-black uppercase tracking-widest text-xs text-primary">Total Amount</span>
                            <div className="text-3xl font-black text-primary tracking-tighter">
                                <span className="text-sm font-bold mr-1 italic text-primary/30">Rp</span>
                                {Number(booking.total_price).toLocaleString('id-ID')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status-based Actions */}
                {booking.status === 'PENDING_PAYMENT' && (
                    <div className="pt-6">
                        <div className="bg-accent/5 border border-accent/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-primary text-sm uppercase tracking-tight">Payment Pending</p>
                                    <p className="text-xs font-bold text-primary/40">Your escape is being held for 15 minutes.</p>
                                </div>
                            </div>
                            <Button 
                                onClick={handlePay}
                                className="w-full md:w-auto h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs px-10 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                <CreditCard size={16} className="mr-2" /> Pay Now
                            </Button>
                        </div>
                    </div>
                )}

                {booking.status === 'PAID' && (
                    <div className="pt-6">
                        <div className="bg-green-50 border border-green-100 rounded-3xl p-8 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="font-black text-primary text-sm uppercase tracking-tight">Payment Confirmed</p>
                                <p className="text-xs font-bold text-primary/40">Pack your bags! Your escape is ready.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
