'use client';

import { useState, useEffect } from 'react';
import { useBookingDetail, useCreateReview } from "@/hooks/useBooking";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Tent, ArrowLeft, Clock, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useParams } from 'next/navigation';

export default function BookingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: booking, isLoading, isError, refetch } = useBookingDetail(id);
  const createReview = useCreateReview();
  const [timeLeft, setTimeLeft] = useState<string>("");
  const { t } = useI18n();
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    cleanliness_rating: 5,
    service_rating: 5,
    location_rating: 5,
    value_rating: 5,
    comment: '',
  });
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAnIGhlaWdodD0nMjInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzMwJyBoZWlnaHQ9JzIyJyBmaWxsPSIjZWRlN2RlIi8+PC9zdmc+";

  useEffect(() => {
    if (!booking || booking.status !== 'PENDING_PAYMENT') return;

    const calculateTimeLeft = () => {
      const created = new Date(booking.created_at);
      const expires = new Date(created.getTime() + 15 * 60000);
      const now = new Date();
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00:00");
        refetch(); // Refetch to get updated status from backend
        return;
      }

      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    const statusPollInterval = setInterval(() => {
      refetch();
    }, 8000);
    return () => {
      clearInterval(interval);
      clearInterval(statusPollInterval);
    };
  }, [booking, refetch]);

  if (isLoading) return (
    <div className="container mx-auto px-4 py-10 md:py-14 max-w-3xl space-y-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full rounded-[3rem]" />
    </div>
  );

  if (isError || !booking) return (
    <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <p className="text-primary/40 font-black uppercase tracking-widest mb-8">{t({ id: 'Booking tidak ditemukan', en: 'Booking not found' })}</p>
        <Link href="/bookings/my-trips" className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs">
            {t({ id: 'Kembali ke Perjalanan Saya', en: 'Back to My Trips' })}
        </Link>
    </div>
  );

  const paymentPayload = booking.payment_payload || null;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <Link href="/bookings/my-trips" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors mb-6 md:mb-8 ml-2">
            <ArrowLeft size={12} /> {t({ id: 'Kembali ke Perjalanan Saya', en: 'Back to My Trips' })}
        </Link>

        <div className="glass rounded-[2rem] md:rounded-[3.5rem] border-white/40 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative h-48 md:h-64 bg-gray-100">
                <Image 
                    src={booking.glamping_thumbnail} 
                    alt={booking.glamping_name}
                    fill
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 md:from-black/60 to-transparent" />
                <div className="absolute bottom-4 md:bottom-8 left-6 md:left-10 right-6 md:right-8 text-white">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent mb-1">
                        <MapPin size={10} /> {booking.unit_name}
                    </div>
                    <h1 className="text-xl md:text-3xl font-black tracking-tighter leading-tight">{booking.glamping_name}</h1>
                </div>
                <div className="absolute top-4 md:top-8 right-6 md:right-10">
                    <Badge className="rounded-full px-4 md:px-6 py-1 md:py-2 font-black uppercase tracking-widest text-[8px] md:text-[10px] bg-white text-primary border-none shadow-xl">
                        {(booking.status === 'PENDING_PAYMENT' && timeLeft === "00:00") ? t({ id: 'DIBATALKAN', en: 'CANCELLED' }) : booking.status}
                    </Badge>
                </div>
            </div>

            <div className="p-5 sm:p-6 md:p-8 lg:p-10 space-y-8 md:space-y-10">
                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">{t({ id: 'ID Booking', en: 'Booking ID' })}</p>
                            <p className="font-black text-primary text-base md:text-lg">{booking.booking_code}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">{t({ id: 'Data Tamu', en: 'Guest Details' })}</p>
                            <p className="font-black text-primary text-sm md:text-base">{booking.guest_name}</p>
                            <p className="text-[11px] md:text-xs font-bold text-primary/40 break-all">{booking.guest_email}</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/30">{t({ id: 'Periode Menginap', en: 'Stay Period' })}</p>
                            <div className="flex items-center gap-2 font-black text-primary text-sm md:text-base">
                                <Calendar size={14} className="text-accent flex-shrink-0" />
                                <span className="leading-none">{booking.check_in} — {booking.check_out}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="opacity-5" />

                {/* Items Breakdown */}
                <div className="space-y-6">
                    <h3 className="font-black text-[10px] md:text-xs uppercase tracking-[0.2em] text-primary/40">{t({ id: 'Ringkasan Pesanan', en: 'Order Summary' })}</h3>
                    <div className="space-y-4">
                        {Array.isArray(booking.items) && booking.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-start text-xs md:text-sm font-bold gap-4">
                                <span className="text-primary/60">{item.name} x {item.quantity}</span>
                                <span className="text-primary text-right whitespace-nowrap">Rp {Number(item.total_price).toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                        {(() => {
                          const itemsTotal = Array.isArray(booking.items) 
                            ? booking.items.reduce((sum: number, item: any) => sum + Number(item.total_price || 0), 0)
                            : 0;
                          const diff = Number(booking.total_price) - itemsTotal;
                          if (diff <= 0) return null;
                          return (
                            <div className="flex justify-between items-center text-[10px] md:text-xs font-bold text-primary/40 uppercase tracking-widest">
                              <span>{t({ id: 'Pajak & Biaya', en: 'Taxes & Fees' })}</span>
                              <span>Rp {diff.toLocaleString('id-ID')}</span>
                            </div>
                          );
                        })()}
                        <div className="pt-6 border-t border-primary/5 flex justify-between items-end gap-2">
                            <span className="font-black uppercase tracking-widest text-[10px] md:text-xs text-primary mb-1">{t({ id: 'Total', en: 'Total' })}</span>
                            <div className="text-xl md:text-3xl font-black text-primary tracking-tighter text-right">
                                <span className="text-[10px] md:text-sm font-bold mr-1 italic text-primary/30">Rp</span>
                                {Number(booking.total_price).toLocaleString('id-ID')}
                            </div>
                        </div>
                        <p className="text-[10px] md:text-xs font-bold text-primary/40 uppercase tracking-widest">
                          {t({ id: 'Total termasuk pajak & biaya layanan.', en: 'Total includes taxes & service fees.' })}
                        </p>
                    </div>
                </div>

                {/* Status-based Actions */}
                {booking.status === 'PENDING_PAYMENT' && timeLeft !== "00:00" && (
                    <div className="pt-4 md:pt-6">
                        <div className="bg-accent/5 border border-accent/10 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-left w-full">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-xl md:rounded-2xl flex items-center justify-center text-accent flex-shrink-0">
                                    <Clock size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-black text-primary text-xs md:text-sm uppercase tracking-tight">{t({ id: 'Menunggu Pembayaran', en: 'Payment Pending' })}</p>
                                        <Badge variant="outline" className="text-[9px] md:text-[10px] font-black border-accent/30 text-accent px-2 py-0">
                                            {timeLeft}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] md:text-xs font-bold text-primary/40 leading-relaxed">
                                      {t({ id: 'Pesanan sedang ditahan. Selesaikan pembayaran sebelum kedaluwarsa.', en: 'Your escape is being held. Complete payment before it expires.' })}
                                    </p>
                                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-accent/80 mt-2">
                                      {t({ id: 'Status pembayaran dicek otomatis', en: 'Payment status refreshes automatically' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {paymentPayload && (
                          <div className="mt-4 bg-white/60 border border-white/70 rounded-2xl md:rounded-3xl p-6 md:p-8">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-3">{t({ id: 'Instruksi Pembayaran', en: 'Payment Instructions' })}</p>
                            {Array.isArray(paymentPayload.va_numbers) && (
                              <div className="space-y-2">
                                {paymentPayload.va_numbers.map((va: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between border-b border-primary/5 py-2">
                                    <span className="font-bold uppercase">{va.bank}</span>
                                    <span className="font-mono">{va.va_number}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {paymentPayload.permata_va_number && (
                              <div className="flex items-center justify-between border-b border-primary/5 py-2">
                                <span className="font-bold uppercase">Permata</span>
                                <span className="font-mono">{paymentPayload.permata_va_number}</span>
                              </div>
                            )}
                            {paymentPayload.bill_key && paymentPayload.biller_code && (
                              <div className="text-sm text-primary mt-2">
                                <div className="flex items-center justify-between border-b border-primary/5 py-2">
                                  <span className="font-bold uppercase">Mandiri Bill Key</span>
                                  <span className="font-mono">{paymentPayload.bill_key}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-primary/5 py-2">
                                  <span className="font-bold uppercase">Biller Code</span>
                                  <span className="font-mono">{paymentPayload.biller_code}</span>
                                </div>
                              </div>
                            )}
                            {Array.isArray(paymentPayload.actions) && (
                              <div className="mt-3 space-y-2">
                                {paymentPayload.actions.map((action: any, idx: number) => (
                                  <a key={idx} href={action.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent underline">
                                    {action.name || 'Open Payment Link'}
                                  </a>
                                ))}
                              </div>
                            )}
                            {paymentPayload.payment_code && (
                              <div className="text-sm text-primary mt-2">
                                <div className="flex items-center justify-between border-b border-primary/5 py-2">
                                  <span className="font-bold uppercase">{paymentPayload.store || 'CStore'}</span>
                                  <span className="font-mono">{paymentPayload.payment_code}</span>
                                </div>
                              </div>
                            )}
                            {paymentPayload.qr_string && (
                              <p className="text-sm text-primary/70 mt-2">QR String: {paymentPayload.qr_string}</p>
                            )}
                          </div>
                        )}
                    </div>
                )}

                {(booking.status === 'CANCELLED' || (booking.status === 'PENDING_PAYMENT' && timeLeft === "00:00")) && (
                    <div className="pt-4 md:pt-6">
                        <div className="bg-red-50 border border-red-100 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-left w-full">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-xl md:rounded-2xl flex items-center justify-center text-red-600 flex-shrink-0">
                                    <XCircle size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-primary text-xs md:text-sm uppercase tracking-tight mb-1">{t({ id: 'Booking Dibatalkan', en: 'Booking Cancelled' })}</p>
                                    <p className="text-[10px] md:text-xs font-bold text-primary/40 leading-relaxed">
                                      {t({ id: 'Waktu pembayaran telah habis. Silakan buat booking baru.', en: 'The payment window has expired. Please create a new booking.' })}
                                    </p>
                                </div>
                            </div>
                            <Link href="/search" className="w-full md:w-auto inline-flex items-center justify-center h-12 md:h-14 rounded-xl md:rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] md:text-xs px-10 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                {t({ id: 'Cari Lagi', en: 'Search Again' })}
                            </Link>
                        </div>
                    </div>
                )}

                {booking.status === 'PAID' && (
                    <div className="pt-4 md:pt-6">
                        <div className="bg-green-50 border border-green-100 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 text-left w-full">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl md:rounded-2xl flex items-center justify-center text-green-600 flex-shrink-0">
                                    <CheckCircle2 size={20} className="md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-primary text-xs md:text-sm uppercase tracking-tight mb-1">{t({ id: 'Pembayaran Dikonfirmasi', en: 'Payment Confirmed' })}</p>
                                    <p className="text-[10px] md:text-xs font-bold text-primary/40 leading-relaxed">
                                      {t({ id: 'Siapkan barang! Pesananmu sudah siap.', en: 'Pack your bags! Your escape is ready.' })}
                                    </p>
                                </div>
                            </div>
                            <Link href={`/messages?booking_id=${booking.id}`} className="w-full md:w-auto inline-flex items-center justify-center h-12 md:h-14 rounded-xl md:rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] md:text-xs px-10 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                {t({ id: 'Chat Host', en: 'Message Host' })}
                            </Link>
                        </div>
                    </div>
                )}

                {booking.status === 'COMPLETED' && (
                  <div className="pt-4 md:pt-6">
                    <div className="rounded-2xl md:rounded-3xl border border-primary/10 bg-white/70 p-6 md:p-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                        {t({ id: 'Ulasan', en: 'Review' })}
                      </p>
                      <h3 className="mt-1 text-lg md:text-xl font-black tracking-tight text-primary">
                        {booking.review
                          ? t({ id: 'Ulasan kamu sudah terkirim', en: 'Your review is submitted' })
                          : t({ id: 'Tulis ulasan setelah menginap', en: 'Write a review after your stay' })}
                      </h3>

                      {booking.review ? (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="rounded-2xl border border-primary/10 bg-white/80 p-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">Rating</div>
                            <div className="mt-1 font-black text-primary">★ {booking.review.rating} / 5</div>
                            {booking.review.comment ? (
                              <div className="mt-3 text-primary/70 font-semibold whitespace-pre-wrap">{booking.review.comment}</div>
                            ) : null}
                          </div>
                          <div className="rounded-2xl border border-primary/10 bg-white/80 p-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">Detail</div>
                            <div className="mt-2 space-y-1 text-xs font-bold text-primary/70">
                              <div>Cleanliness: {booking.review.cleanliness_rating ?? '-'}</div>
                              <div>Service: {booking.review.service_rating ?? '-'}</div>
                              <div>Location: {booking.review.location_rating ?? '-'}</div>
                              <div>Value: {booking.review.value_rating ?? '-'}</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form
                          className="mt-5 space-y-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            createReview.mutate(
                              {
                                bookingId: booking.id,
                                rating: Number(reviewForm.rating),
                                cleanliness_rating: Number(reviewForm.cleanliness_rating),
                                service_rating: Number(reviewForm.service_rating),
                                location_rating: Number(reviewForm.location_rating),
                                value_rating: Number(reviewForm.value_rating),
                                comment: reviewForm.comment?.trim() || undefined,
                              },
                              {
                                onSuccess: () => {
                                  setReviewForm((prev) => ({ ...prev, comment: '' }));
                                },
                              }
                            );
                          }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                              { key: 'rating', label: 'Overall' },
                              { key: 'cleanliness_rating', label: 'Cleanliness' },
                              { key: 'service_rating', label: 'Service' },
                              { key: 'location_rating', label: 'Location' },
                              { key: 'value_rating', label: 'Value' },
                            ].map((field) => (
                              <label key={field.key} className="space-y-1">
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">{field.label}</div>
                                <select
                                  className="h-11 w-full rounded-2xl border border-primary/15 bg-white px-3 text-sm font-bold text-primary"
                                  value={(reviewForm as any)[field.key]}
                                  onChange={(e) =>
                                    setReviewForm((prev) => ({ ...prev, [field.key]: Number(e.target.value) }))
                                  }
                                >
                                  {[5, 4, 3, 2, 1].map((v) => (
                                    <option key={v} value={v}>
                                      {v}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ))}
                          </div>

                          <div className="space-y-1">
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                              {t({ id: 'Komentar (opsional)', en: 'Comment (optional)' })}
                            </div>
                            <Textarea
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                              rows={4}
                              placeholder={t({ id: 'Ceritain pengalamanmu…', en: 'Tell us about your experience…' })}
                              className="rounded-2xl bg-white/80"
                            />
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="text-[10px] font-bold text-primary/40">
                              {createReview.isPending
                                ? t({ id: 'Mengirim…', en: 'Submitting…' })
                                : createReview.isError
                                  ? t({ id: 'Gagal mengirim ulasan', en: 'Failed to submit review' })
                                  : null}
                            </div>
                            <Button
                              type="submit"
                              className="h-12 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px]"
                              disabled={createReview.isPending}
                            >
                              {t({ id: 'Kirim Ulasan', en: 'Submit Review' })}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
            </div>
        </div>
    </div>
  );
}
