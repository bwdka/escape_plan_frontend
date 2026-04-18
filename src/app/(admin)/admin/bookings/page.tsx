'use client';

import { useMemo, useState } from 'react';
import { useAdminBookings, useAdminRefundBooking } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

type BookingRow = {
  id: number;
  check_in?: string;
  total_price?: number;
  payment_status?: string;
  status?: string;
  user?: { name?: string };
  guest_name?: string;
  unit?: { glamping?: { name?: string } };
};

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      payment_status: paymentStatus === 'all' ? undefined : paymentStatus,
      page,
    }),
    [search, status, paymentStatus, page]
  );

  const { data: response, isLoading } = useAdminBookings(params);
  const refund = useAdminRefundBooking();

  const bookings = (response?.data || []) as BookingRow[];

  const onRefund = (id: number) => {
    if (!window.confirm(`Refund booking ESC-${id}?`)) return;
    const reason = window.prompt('Reason (optional):', '') || undefined;
    refund.mutate(
      { id, reason },
      {
        onSuccess: () => toast.success('Refund processed'),
        onError: (err: unknown) => {
          const error = err as AxiosError<{ message?: string }>;
          toast.error(error.response?.data?.message || 'Failed to process refund');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Finance</p>
          <h1 className="font-display text-3xl text-slate-900 tracking-tight">Transaction Monitor</h1>
          <p className="text-sm text-slate-600">Track payment status, filter bookings, and process refund safely.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search guest/email/booking id"
            className="md:col-span-2 rounded-2xl"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-2xl border border-white/70 bg-white px-3 text-xs font-bold"
          >
            <option value="all">All Status</option>
            <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
            <option value="PAID">PAID</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-2xl border border-white/70 bg-white px-3 text-xs font-bold"
          >
            <option value="all">All Payment</option>
            <option value="paid">paid</option>
            <option value="unpaid">unpaid</option>
            <option value="cancelled">cancelled</option>
            <option value="expired">expired</option>
          </select>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-white/70 bg-white/80 shadow-xl reveal-up">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/70 border-b border-white/70">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Booking Info</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Dates</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/70">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                    </tr>
                  ))
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/70 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-black text-slate-900">ESC-{booking.id}</p>
                          <p className="text-xs text-slate-500">{booking.unit?.glamping?.name || 'Glamping Site'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-sm font-medium">{booking.user?.name || booking.guest_name || 'Guest'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {booking.check_in}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">
                        Rp {Number(booking.total_price || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <Badge variant={booking.payment_status === 'paid' ? 'default' : 'outline'}>
                          {booking.payment_status}
                        </Badge>
                        <div className="text-[10px] font-bold text-slate-500">{booking.status}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-xl"
                          disabled={refund.isPending || booking.payment_status !== 'paid'}
                          onClick={() => onRefund(booking.id)}
                        >
                          Refund
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-white/70 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500">Total: {response?.total || 0}</div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={(response?.current_page || 1) <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <span className="text-xs font-bold text-slate-500">
                Page {response?.current_page || 1} / {response?.last_page || 1}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                disabled={(response?.current_page || 1) >= (response?.last_page || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
