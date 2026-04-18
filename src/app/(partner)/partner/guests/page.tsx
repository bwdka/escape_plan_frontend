'use client';

import { useMemo, useState } from 'react';
import { usePartnerGuestBookings } from '@/hooks/usePartner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerGuestBooking } from '@/types/partner';

export default function PartnerGuestBookingsPage() {
  const { data: bookings = [], isLoading } = usePartnerGuestBookings();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return bookings.filter((item: PartnerGuestBooking) => {
      if (!keyword) return true;
      const haystack = [
        item.guest_name,
        item.guest_email,
        item.guest_phone,
        item.booking_code,
        item.glamping_name,
        item.unit_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });
  }, [bookings, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-[2rem]" />
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Booking Guests</p>
        <h2 className="mt-1 font-display text-3xl text-primary tracking-tight">Daftar Tamu Booking</h2>
        <p className="mt-2 text-sm font-medium text-primary/55">
          Hanya menampilkan tamu dengan pembayaran berhasil (paid) pada unit milik Anda.
        </p>
        <div className="mt-5">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama tamu, email, kode booking..."
            className="rounded-2xl"
          />
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-white/70 bg-white/82 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-primary/5">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Booking</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Tamu</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Unit</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Stay</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-primary/45 font-semibold">
                    Tidak ada data tamu booking.
                  </td>
                </tr>
              )}
              {filtered.map((item: PartnerGuestBooking) => (
                <tr key={item.booking_id} className="border-t border-primary/5 hover:bg-primary/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-black text-primary">{item.booking_code}</div>
                    <div className="text-xs text-primary/50">{item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-black text-primary">{item.guest_name || '-'}</div>
                    <div className="text-xs text-primary/55">{item.guest_email || '-'}</div>
                    <div className="text-xs text-primary/45">{item.guest_phone || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary">{item.glamping_name || '-'}</div>
                    <div className="text-xs text-primary/55">{item.unit_name || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-primary/70">In: {item.check_in || '-'}</div>
                    <div className="text-xs text-primary/70">Out: {item.check_out || '-'}</div>
                  </td>
                  <td className="px-4 py-3 space-y-1">
                    <Badge
                      variant="outline"
                      className={`rounded-full text-[10px] font-black ${
                        item.payment_status === 'paid'
                          ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                          : 'border-amber-200 text-amber-700 bg-amber-50'
                      }`}
                    >
                      {item.payment_status || '-'}
                    </Badge>
                    <div className="text-[10px] font-bold text-primary/55">{item.booking_status || '-'}</div>
                  </td>
                  <td className="px-4 py-3 font-black text-primary whitespace-nowrap">
                    Rp {Number(item.total_price || 0).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
