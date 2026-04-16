'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useI18n } from '@/i18n/I18nProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock3, XCircle, Loader2 } from 'lucide-react';

type GuestStatusResponse = {
  id: number;
  booking_code: string;
  status: string;
  payment_status: string;
  payment_payload?: any;
  created_at: string;
};

function GuestBookingStatusContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const bookingId = Number(searchParams.get('booking_id') || 0);
  const trackingToken = searchParams.get('token') || '';

  const [data, setData] = useState<GuestStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    if (!bookingId || !trackingToken) {
      setError(t({ id: 'Link status tidak valid', en: 'Invalid status link' }));
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post('/bookings/guest-status', {
        booking_id: bookingId,
        tracking_token: trackingToken,
      });
      const next = res?.data?.data as GuestStatusResponse;
      setData(next);
      setError(null);
      if (typeof window !== 'undefined' && next?.id) {
        localStorage.setItem('guest_payment_tracker', JSON.stringify({
          bookingId: next.id,
          status: next.status,
          trackingToken,
          updatedAt: new Date().toISOString(),
          vaBank: next.payment_payload?.va_numbers?.[0]?.bank || null,
          vaNumber: next.payment_payload?.va_numbers?.[0]?.va_number || null,
          permataVaNumber: next.payment_payload?.permata_va_number || null,
          billKey: next.payment_payload?.bill_key || null,
          billerCode: next.payment_payload?.biller_code || null,
          paymentCode: next.payment_payload?.payment_code || null,
          store: next.payment_payload?.store || null,
        }));
      }
    } catch {
      setError(t({ id: 'Gagal mengambil status pembayaran', en: 'Failed to load payment status' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, trackingToken]);

  const statusUi = useMemo(() => {
    if (data?.status === 'PAID') {
      return { Icon: CheckCircle2, color: 'text-emerald-600', label: t({ id: 'Pembayaran Berhasil', en: 'Payment Confirmed' }) };
    }
    if (data?.status === 'CANCELLED') {
      return { Icon: XCircle, color: 'text-red-600', label: t({ id: 'Pembayaran Gagal/Kedaluwarsa', en: 'Payment Failed/Expired' }) };
    }
    return { Icon: Clock3, color: 'text-amber-600', label: t({ id: 'Menunggu Pembayaran', en: 'Waiting for Payment' }) };
  }, [data?.status, t]);

  return (
    <div className="container mx-auto px-4 py-10 md:py-14 max-w-2xl">
      <div className="glass rounded-[2rem] border-white/40 shadow-2xl p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
            {t({ id: 'Status Pembayaran Guest', en: 'Guest Payment Status' })}
          </p>
          <h1 className="text-2xl font-black text-primary tracking-tight">
            {data?.booking_code || (bookingId ? `ESC-${bookingId}` : 'ESC')}
          </h1>
        </div>

        {isLoading && (
          <p className="text-sm font-bold text-primary/60">{t({ id: 'Memuat status pembayaran...', en: 'Loading payment status...' })}</p>
        )}

        {!isLoading && error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50">
            <p className="text-sm font-bold text-red-600">{error}</p>
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-primary/10 bg-white/70">
              <div className="flex items-center gap-2">
                <statusUi.Icon size={18} className={statusUi.color} />
                <p className={`text-sm font-black ${statusUi.color}`}>{statusUi.label}</p>
              </div>
              <Badge className="rounded-full bg-white border border-primary/15 text-primary font-black">
                {data.status}
              </Badge>
            </div>

            <div className="space-y-3 p-4 rounded-2xl border border-primary/10 bg-white/70">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                {t({ id: 'Instruksi Pembayaran', en: 'Payment Instructions' })}
              </p>

              {data.payment_payload?.va_numbers?.map((va: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between border-b border-primary/5 py-2 text-sm">
                  <span className="font-bold uppercase text-primary">{va.bank}</span>
                  <span className="font-mono text-primary">{va.va_number}</span>
                </div>
              ))}

              {data.payment_payload?.permata_va_number && (
                <div className="flex items-center justify-between border-b border-primary/5 py-2 text-sm">
                  <span className="font-bold uppercase text-primary">Permata</span>
                  <span className="font-mono text-primary">{data.payment_payload.permata_va_number}</span>
                </div>
              )}

              {data.payment_payload?.bill_key && data.payment_payload?.biller_code && (
                <>
                  <div className="flex items-center justify-between border-b border-primary/5 py-2 text-sm">
                    <span className="font-bold uppercase text-primary">Mandiri Bill Key</span>
                    <span className="font-mono text-primary">{data.payment_payload.bill_key}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-primary/5 py-2 text-sm">
                    <span className="font-bold uppercase text-primary">Biller Code</span>
                    <span className="font-mono text-primary">{data.payment_payload.biller_code}</span>
                  </div>
                </>
              )}

              {data.payment_payload?.payment_code && (
                <div className="flex items-center justify-between border-b border-primary/5 py-2 text-sm">
                  <span className="font-bold uppercase text-primary">{data.payment_payload.store || 'CStore'}</span>
                  <span className="font-mono text-primary">{data.payment_payload.payment_code}</span>
                </div>
              )}

              {data.payment_payload?.actions?.map((action: any, idx: number) => (
                <a key={idx} href={action.url} target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-accent underline">
                  {action.name || 'Open Payment Link'}
                </a>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="rounded-xl" onClick={fetchStatus}>
            {t({ id: 'Refresh Status', en: 'Refresh Status' })}
          </Button>
          <Link href="/search" className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-black">
            {t({ id: 'Kembali ke Pencarian', en: 'Back to Search' })}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function GuestBookingStatusPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-10 md:py-14 max-w-2xl flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-bold text-primary/60">Loading...</p>
        </div>
      </div>
    }>
      <GuestBookingStatusContent />
    </Suspense>
  );
}
