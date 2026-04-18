'use client';

import { useMemo, useState } from 'react';
import { usePartnerBookingAction, usePartnerBookings } from '@/hooks/usePartner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerBooking } from '@/types/partner';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

const PER_PAGE = 20;

export default function PartnerBookingsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [paymentStatus, setPaymentStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  const params = useMemo(() => ({
    q: search || undefined,
    status: status === 'all' ? undefined : status,
    payment_status: paymentStatus === 'all' ? undefined : paymentStatus,
    page,
    per_page: PER_PAGE,
  }), [search, status, paymentStatus, page]);

  const { data, isLoading } = usePartnerBookings(params);
  const { mutate: runAction, isPending } = usePartnerBookingAction();

  const bookings = data?.data || [];
  const meta = data?.meta;

  const performAction = (bookingId: number, action: 'check_in' | 'check_out' | 'no_show' | 'cancel') => {
    runAction(
      { bookingId, action },
      {
        onSuccess: () => toast.success('Booking updated'),
        onError: (err: unknown) => {
          const error = err as AxiosError<{ message?: string }>;
          toast.error(error.response?.data?.message || 'Failed to update booking');
        },
      }
    );
  };

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
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Reservations</p>
        <h2 className="mt-1 font-display text-3xl text-primary tracking-tight">Kelola Booking</h2>
        <p className="mt-2 text-sm font-medium text-primary/55">
          Kelola operasional tamu: check-in, check-out, no-show, dan pembatalan sebelum check-in.
        </p>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Cari nama tamu, email, phone, booking ID..."
            className="rounded-2xl md:col-span-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-2xl border border-primary/15 bg-white px-3 text-xs font-bold text-primary"
            >
              <option value="all">All Status</option>
              <option value="PENDING_PAYMENT">Pending</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-2xl border border-primary/15 bg-white px-3 text-xs font-bold text-primary"
            >
              <option value="all">All Payment</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-white/70 bg-white/82 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-primary/5">
              <tr className="text-left">
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Booking</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Guest</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Stay</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Status</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-primary/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-primary/45 font-semibold">
                    Tidak ada booking.
                  </td>
                </tr>
              )}
              {bookings.map((item: PartnerBooking) => {
                const canCheckIn = item.payment_status === 'paid' && item.booking_status === 'PAID' && item.check_in_status !== 'checked_in';
                const canCheckOut = item.check_in_status === 'checked_in' && item.booking_status === 'PAID';
                const canNoShow = item.payment_status === 'paid' && item.booking_status === 'PAID' && item.check_in_status !== 'checked_in';
                const canCancel = item.booking_status !== 'CANCELLED' && item.booking_status !== 'COMPLETED';

                return (
                  <tr key={item.booking_id} className="border-t border-primary/5 hover:bg-primary/[0.02]">
                    <td className="px-4 py-3">
                      <div className="font-black text-primary">{item.booking_code}</div>
                      <div className="text-xs text-primary/55">{item.glamping_name || '-'} • {item.unit_name || '-'}</div>
                      <div className="text-xs text-primary/45">Rp {Number(item.total_price || 0).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-black text-primary">{item.guest_name || '-'}</div>
                      <div className="text-xs text-primary/55">{item.guest_email || '-'}</div>
                      <div className="text-xs text-primary/45">{item.guest_phone || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-primary/70">In: {item.check_in || '-'}</div>
                      <div className="text-xs text-primary/70">Out: {item.check_out || '-'}</div>
                    </td>
                    <td className="px-4 py-3 space-y-1">
                      <Badge variant="outline" className="rounded-full text-[10px] font-black">
                        {item.booking_status || '-'}
                      </Badge>
                      <div className="text-[10px] font-bold text-primary/55">{item.payment_status || '-'}</div>
                      <div className="text-[10px] font-bold text-primary/40">{item.check_in_status || 'pending'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button size="sm" className="h-7 rounded-xl text-[10px] px-2.5" disabled={!canCheckIn || isPending} onClick={() => performAction(item.booking_id, 'check_in')}>
                          Check-in
                        </Button>
                        <Button size="sm" className="h-7 rounded-xl text-[10px] px-2.5" variant="secondary" disabled={!canCheckOut || isPending} onClick={() => performAction(item.booking_id, 'check_out')}>
                          Check-out
                        </Button>
                        <Button size="sm" className="h-7 rounded-xl text-[10px] px-2.5" variant="outline" disabled={!canNoShow || isPending} onClick={() => performAction(item.booking_id, 'no_show')}>
                          No-show
                        </Button>
                        <Button size="sm" className="h-7 rounded-xl text-[10px] px-2.5" variant="destructive" disabled={!canCancel || isPending} onClick={() => performAction(item.booking_id, 'cancel')}>
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-primary/5">
          <div className="text-xs font-semibold text-primary/55">
            Total: {meta?.total || 0}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl text-[10px] font-black"
              disabled={!meta || page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </Button>
            <div className="text-xs font-bold text-primary/60">
              Page {meta?.current_page || 1} / {meta?.last_page || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl text-[10px] font-black"
              disabled={!meta || page >= (meta?.last_page || 1)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
