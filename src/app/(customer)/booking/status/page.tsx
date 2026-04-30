'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { useI18n } from '@/i18n/I18nProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock3, XCircle, Loader2 } from 'lucide-react';

type GuestStatusResponse = {
  id: number;
  uuid?: string;
  booking_code: string;
  status: string;
  payment_status: string;
  payment_payload?: Record<string, unknown>;
  created_at: string;
  guest_name?: string;
  check_in?: string;
  check_out?: string;
  total_guests?: number;
  unit_name?: string;
  glamping_name?: string;
  total_price?: number | string;
  service_fee?: number | string;
  discount_amount?: number | string;
  subtotal_price?: number | string;
  expired_at?: string;
};
type PaymentAction = { name?: string; url?: string };
type VaNumber = { bank?: string; va_number?: string };

function GuestBookingStatusContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = Number(searchParams.get('booking_id') || 0);
  const trackingToken = searchParams.get('token') || '';
  const returnToStatus = `/booking/status?booking_id=${bookingId}&token=${encodeURIComponent(trackingToken)}`;

  const [data, setData] = useState<GuestStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [isForceChecking, setIsForceChecking] = useState(false);

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
    } catch (err: unknown) {
      const maybeErr = err as { response?: { status?: number } };
      const statusCode = maybeErr?.response?.status;
      if (statusCode === 403) {
        setError(t({ id: 'Link pembayaran tidak valid atau sudah kedaluwarsa.', en: 'This payment link is invalid or has expired.' }));
      } else {
        setError(t({ id: 'Gagal mengambil status pembayaran', en: 'Failed to load payment status' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const forceCheckPayment = async () => {
    setIsForceChecking(true);
    await fetchStatus();
    const start = Date.now();
    const aggressivePoll = setInterval(async () => {
      await fetchStatus();
      if (Date.now() - start >= 120000) {
        clearInterval(aggressivePoll);
        setIsForceChecking(false);
      }
    }, 3000);
    setTimeout(() => {
      clearInterval(aggressivePoll);
      setIsForceChecking(false);
    }, 121000);
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, trackingToken]);

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasAuthToken(!!localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (!data || data.status !== 'PAID' || !hasAuthToken) return;
    const target = data.uuid || String(data.id || '');
    if (!target) return;
    const timeout = setTimeout(() => {
      router.push(`/bookings/${target}`);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [data, hasAuthToken, router]);

  const statusUi = useMemo(() => {
    if (data?.status === 'PAID') {
      return { Icon: CheckCircle2, color: 'text-emerald-600', label: t({ id: 'Pembayaran Berhasil', en: 'Payment Confirmed' }) };
    }
    if (data?.status === 'CANCELLED') {
      return { Icon: XCircle, color: 'text-red-600', label: t({ id: 'Pembayaran Gagal/Kedaluwarsa', en: 'Payment Failed/Expired' }) };
    }
    return { Icon: Clock3, color: 'text-amber-600', label: t({ id: 'Menunggu Pembayaran', en: 'Waiting for Payment' }) };
  }, [data?.status, t]);
  const statusHint = useMemo(() => {
    if (data?.status === 'PAID') {
      return hasAuthToken
        ? t({ id: 'Pembayaran terverifikasi. Mengalihkan ke detail perjalanan Anda...', en: 'Payment verified. Redirecting to your trip details...' })
        : t({ id: 'Pembayaran aman. Silakan claim booking agar masuk ke akun Anda.', en: 'Payment is secured. Claim this booking to attach it to your account.' });
    }
    if (data?.status === 'CANCELLED') {
      return t({ id: 'Waktu pembayaran berakhir atau transaksi dibatalkan.', en: 'Payment time expired or the transaction was cancelled.' });
    }
    return t({ id: 'Selesaikan pembayaran sebelum batas waktu berakhir.', en: 'Complete payment before the deadline to keep this booking.' });
  }, [data?.status, hasAuthToken, t]);

  const paymentActions = useMemo<PaymentAction[]>(() => {
    const raw = data?.payment_payload?.actions;
    return Array.isArray(raw) ? (raw as PaymentAction[]) : [];
  }, [data?.payment_payload?.actions]);
  const qrString = data?.payment_payload?.qr_string || '';
  const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;
  const parseAmount = (value: unknown) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };
  const formatDateTime = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const priceSummary = useMemo(() => {
    if (!data) return null;
    const payload = data.payment_payload || {};
    const total = parseAmount(data.total_price ?? payload.gross_amount ?? payload.total_price);
    const serviceFee = parseAmount(data.service_fee ?? payload.service_fee);
    const discount = parseAmount(data.discount_amount ?? payload.discount_amount);
    const subtotalRaw = data.subtotal_price ?? payload.subtotal_price ?? payload.base_price;
    const subtotal = subtotalRaw != null ? parseAmount(subtotalRaw) : Math.max(total - serviceFee + discount, 0);
    if (total <= 0 && subtotal <= 0 && serviceFee <= 0 && discount <= 0) return null;
    return { subtotal, serviceFee, discount, total };
  }, [data]);
  const stayInfo = useMemo(() => {
    if (!data?.check_in || !data?.check_out) return null;
    return `${data.check_in} - ${data.check_out}`;
  }, [data?.check_in, data?.check_out]);
  const paymentDeadline = useMemo(() => {
    return formatDateTime(data?.expired_at || data?.payment_payload?.expiry_time || data?.payment_payload?.transaction_time);
  }, [data?.expired_at, data?.payment_payload?.expiry_time, data?.payment_payload?.transaction_time]);
  const countdown = useMemo(() => {
    const rawDeadline = data?.expired_at || data?.payment_payload?.expiry_time;
    if (!rawDeadline) return null;
    const deadlineMs = new Date(rawDeadline).getTime();
    if (!Number.isFinite(deadlineMs)) return null;
    const remainingMs = Math.max(0, deadlineMs - nowMs);
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      isExpired: remainingMs <= 0,
      label: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
  }, [data?.expired_at, data?.payment_payload?.expiry_time, nowMs]);
  const qrActionUrl = useMemo(() => {
    const qrAction = paymentActions.find((action) => {
      const name = String(action?.name || '').toLowerCase();
      return name.includes('generate-qr-code') || name.includes('deeplink-redirect');
    });
    return qrAction?.url || '';
  }, [paymentActions]);
  const qrImageUrl = useMemo(() => {
    if (!qrString) return '';
    return `https://quickchart.io/qr?text=${encodeURIComponent(qrString)}&size=480&margin=2&ecLevel=M`;
  }, [qrString]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <div className="glass rounded-[2rem] border-white/40 shadow-2xl p-5 md:p-8 space-y-5 md:space-y-6">
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
            <div className="mt-3 flex gap-2">
              <Link href="/search" className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest">
                {t({ id: 'Buat Booking Baru', en: 'Create New Booking' })}
              </Link>
              <Button type="button" variant="outline" className="h-9 rounded-lg text-xs font-black uppercase tracking-widest" onClick={fetchStatus}>
                {t({ id: 'Coba Lagi', en: 'Try Again' })}
              </Button>
            </div>
          </div>
        )}

        {!isLoading && data && (
          <>
            <div className="space-y-3 p-4 rounded-2xl border border-primary/10 bg-white/70 transition-all duration-300 animate-in fade-in-50">
              <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <statusUi.Icon size={18} className={statusUi.color} />
                <p className={`text-sm font-black ${statusUi.color} truncate`}>{statusUi.label}</p>
              </div>
              <div className="flex items-center gap-2">
                {countdown && data.status === 'PENDING_PAYMENT' && (
                  <Badge className={`rounded-full font-black ${countdown.isExpired ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {countdown.isExpired
                      ? t({ id: 'Kedaluwarsa', en: 'Expired' })
                      : `${t({ id: 'Sisa', en: 'Left' })} ${countdown.label}`}
                  </Badge>
                )}
                <Badge className="rounded-full bg-white border border-primary/15 text-primary font-black">
                  {data.status}
                </Badge>
              </div>
            </div>
            <p className="text-xs font-semibold text-primary/60">{statusHint}</p>
            </div>
            {data.status === 'PAID' && !hasAuthToken && (
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 space-y-3">
                <p className="text-sm font-black text-amber-800">
                  {t({ id: 'Pembayaran berhasil, tapi Anda belum login.', en: 'Payment is successful, but you are not logged in yet.' })}
                </p>
                <p className="text-xs font-semibold text-amber-700">
                  {t({ id: 'Detail booking tetap bisa dilihat di halaman ini. Login untuk menyimpan perjalanan ke akun Anda.', en: 'Your booking details are still available on this page. Log in to save this trip to your account.' })}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href={`/login?redirect=${encodeURIComponent(returnToStatus)}`} className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest">
                    {t({ id: 'Claim Booking', en: 'Claim Booking' })}
                  </Link>
                  <Link href={`/register?redirect=${encodeURIComponent(returnToStatus)}`} className="inline-flex items-center justify-center h-10 px-4 rounded-lg border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                    {t({ id: 'Daftar & Claim', en: 'Register & Claim' })}
                  </Link>
                </div>
              </div>
            )}

            {data.status === 'PAID' && (
              <div className="space-y-3 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  {t({ id: 'Bukti Pembayaran', en: 'Payment Receipt' })}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center justify-between md:block">
                    <span className="text-emerald-800/70">{t({ id: 'Kode Booking', en: 'Booking Code' })}</span>
                    <span className="font-black text-emerald-900 md:block">{data.booking_code}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="text-emerald-800/70">{t({ id: 'Total Dibayar', en: 'Amount Paid' })}</span>
                    <span className="font-black text-emerald-900 md:block">{formatRupiah(parseAmount(data.total_price ?? data.payment_payload?.gross_amount))}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="text-emerald-800/70">{t({ id: 'Metode', en: 'Method' })}</span>
                    <span className="font-black text-emerald-900 md:block">{data.payment_payload?.payment_type || data.payment_payload?.store || 'Payment'}</span>
                  </div>
                  <div className="flex items-center justify-between md:block">
                    <span className="text-emerald-800/70">{t({ id: 'Waktu', en: 'Time' })}</span>
                    <span className="font-black text-emerald-900 md:block">{formatDateTime(data.payment_payload?.transaction_time || data.created_at) || '-'}</span>
                  </div>
                </div>
              </div>
            )}

            {(priceSummary || stayInfo || data.guest_name || data.unit_name || data.glamping_name || paymentDeadline) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {priceSummary && (
                  <div className="space-y-3 p-4 rounded-2xl border border-primary/10 bg-white/70">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                      {t({ id: 'Ringkasan Harga', en: 'Price Summary' })}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-primary/70">
                        <span>{t({ id: 'Subtotal', en: 'Subtotal' })}</span>
                        <span className="font-bold text-primary">{formatRupiah(priceSummary.subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-primary/70">
                        <span>{t({ id: 'Biaya Layanan', en: 'Service Fee' })}</span>
                        <span className="font-bold text-primary">{formatRupiah(priceSummary.serviceFee)}</span>
                      </div>
                      {priceSummary.discount > 0 && (
                        <div className="flex items-center justify-between text-emerald-700">
                          <span>{t({ id: 'Diskon', en: 'Discount' })}</span>
                          <span className="font-bold">- {formatRupiah(priceSummary.discount)}</span>
                        </div>
                      )}
                      <div className="pt-2 mt-2 border-t border-primary/10 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                          {t({ id: 'Total Bayar', en: 'Total Payment' })}
                        </span>
                        <span className="text-lg font-black text-primary">{formatRupiah(priceSummary.total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 p-4 rounded-2xl border border-primary/10 bg-white/70">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                    {t({ id: 'Detail Booking', en: 'Booking Details' })}
                  </p>
                  <div className="space-y-2 text-sm text-primary/80">
                    {data.guest_name && (
                      <div className="flex items-center justify-between gap-3">
                        <span>{t({ id: 'Tamu', en: 'Guest' })}</span>
                        <span className="font-bold text-primary text-right">{data.guest_name}</span>
                      </div>
                    )}
                    {(data.unit_name || data.glamping_name) && (
                      <div className="flex items-center justify-between gap-3">
                        <span>{t({ id: 'Akomodasi', en: 'Stay' })}</span>
                        <span className="font-bold text-primary text-right">{data.unit_name || data.glamping_name}</span>
                      </div>
                    )}
                    {stayInfo && (
                      <div className="flex items-center justify-between gap-3">
                        <span>{t({ id: 'Tanggal', en: 'Dates' })}</span>
                        <span className="font-bold text-primary text-right">{stayInfo}</span>
                      </div>
                    )}
                    {data.total_guests ? (
                      <div className="flex items-center justify-between gap-3">
                        <span>{t({ id: 'Jumlah Tamu', en: 'Guests' })}</span>
                        <span className="font-bold text-primary text-right">{data.total_guests}</span>
                      </div>
                    ) : null}
                    {paymentDeadline && (
                      <div className="pt-2 mt-2 border-t border-primary/10 flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                          {t({ id: 'Batas Bayar', en: 'Payment Deadline' })}
                        </span>
                        <span className="font-bold text-red-600 text-right">{paymentDeadline}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 p-4 rounded-2xl border border-primary/10 bg-white/70">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                {t({ id: 'Instruksi Pembayaran', en: 'Payment Instructions' })}
              </p>

              {(Array.isArray(data.payment_payload?.va_numbers) ? (data.payment_payload?.va_numbers as VaNumber[]) : []).map((va, idx: number) => (
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

              {qrImageUrl && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                    {t({ id: 'QR Pembayaran', en: 'Payment QR' })}
                  </p>
                  <div className="mx-auto w-full max-w-[260px] rounded-xl overflow-hidden border border-primary/10 bg-white p-2">
                    <Image
                      src={qrImageUrl}
                      alt="Payment QR Code"
                      width={480}
                      height={480}
                      unoptimized
                      className="w-full h-auto block rounded-md"
                    />
                  </div>
                  <a
                    href={qrImageUrl}
                    download={`escape-plan-qr-${data?.booking_code || bookingId}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-9 px-3 rounded-lg border border-primary/20 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 transition-colors"
                  >
                    {t({ id: 'Download QR', en: 'Download QR' })}
                  </a>
                  <a
                    href={qrActionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs font-bold text-accent underline"
                  >
                    {t({ id: 'Buka QR di tab baru jika tidak tampil', en: 'Open QR in new tab if it does not load' })}
                  </a>
                </div>
              )}

              {!qrImageUrl && qrActionUrl && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                    {t({ id: 'QR Pembayaran', en: 'Payment QR' })}
                  </p>
                  <div className="mx-auto w-full max-w-[280px] aspect-square rounded-xl overflow-hidden border border-primary/10 bg-white">
                    <iframe
                      src={qrActionUrl}
                      title="Payment QR"
                      className="w-full h-full"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      scrolling="no"
                      style={{ overflow: 'hidden' }}
                    />
                  </div>
                </div>
              )}

              {paymentActions
                .filter((action) => {
                  if (!action?.url || action.url === qrActionUrl) return false;
                  const actionName = String(action?.name || '').toLowerCase();
                  return !actionName.includes('generate-qr-code-v2');
                })
                .map((action, idx: number) => (
                <a key={idx} href={action.url} target="_blank" rel="noopener noreferrer" className="block text-sm font-bold text-accent underline">
                  {action.name || 'Open Payment Link'}
                </a>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-wrap gap-2 md:gap-3">
          <Button type="button" variant="outline" className="rounded-xl" onClick={fetchStatus}>
            {t({ id: 'Refresh Status', en: 'Refresh Status' })}
          </Button>
          {data?.status === 'PENDING_PAYMENT' && (
            <Button type="button" variant="outline" className="rounded-xl" onClick={forceCheckPayment} disabled={isForceChecking}>
              {isForceChecking
                ? t({ id: 'Mengecek pembayaran...', en: 'Checking payment...' })
                : t({ id: 'Saya Sudah Bayar', en: "I've Paid" })}
            </Button>
          )}
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
