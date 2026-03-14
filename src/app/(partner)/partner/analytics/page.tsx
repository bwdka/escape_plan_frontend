'use client';

import { usePartnerAnalytics } from '@/hooks/useAnalytics';
import { Sparkline } from '@/components/ui/Sparkline';

export default function PartnerAnalyticsPage() {
  const { data } = usePartnerAnalytics();
  const series = data?.series || [];
  const bookingSeries = series.map((s: any) => Number(s.bookings || 0));
  const revenueSeries = series.map((s: any) => Number(s.revenue || 0));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Insights</p>
        <h2 className="font-display text-3xl text-primary tracking-tight">Analytics</h2>
        <p className="text-sm text-primary/60">Booking and revenue trend for the last 6 months.</p>
      </div>

      <div className="rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl border border-primary/10 bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest text-primary/40">Bookings Trend</div>
            <Sparkline values={bookingSeries} stroke="#26503e" />
          </div>
          <div className="rounded-2xl border border-primary/10 bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest text-primary/40">Revenue Trend</div>
            <Sparkline values={revenueSeries} stroke="#d4b483" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {series.map((s: any) => (
            <div key={s.label} className="rounded-2xl border border-primary/10 bg-white/70 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-primary/40">{s.label}</div>
              <div className="mt-2 text-lg font-black text-primary">{s.bookings} bookings</div>
              <div className="text-sm font-bold text-primary/60">Rp {Number(s.revenue || 0).toLocaleString('id-ID')}</div>
              <div className="mt-3 h-2 w-full rounded-full bg-primary/10 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (s.bookings || 0) * 10)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
