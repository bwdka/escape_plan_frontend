'use client';

import { useAdminAnalytics } from '@/hooks/useAnalytics';
import { Sparkline } from '@/components/ui/Sparkline';

export default function AdminAnalyticsPage() {
  const { data } = useAdminAnalytics();
  const series = data?.series || [];
  const bookingSeries = series.map((s: any) => Number(s.bookings || 0));
  const revenueSeries = series.map((s: any) => Number(s.revenue || 0));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Insights</p>
        <h2 className="font-display text-3xl text-slate-900 tracking-tight">Platform Analytics</h2>
        <p className="text-sm text-slate-600">Revenue and booking trend for the last 6 months.</p>
      </div>

      <div className="rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">Bookings Trend</div>
            <Sparkline values={bookingSeries} stroke="#0f172a" />
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">Revenue Trend</div>
            <Sparkline values={revenueSeries} stroke="#d4b483" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {series.map((s: any) => (
            <div key={s.label} className="rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">{s.label}</div>
              <div className="mt-2 text-lg font-black text-slate-900">{s.bookings} bookings</div>
              <div className="text-sm font-bold text-slate-600">Rp {Number(s.revenue || 0).toLocaleString('id-ID')}</div>
              <div className="mt-3 h-2 w-full rounded-full bg-black/10 overflow-hidden">
                <div className="h-full bg-slate-900" style={{ width: `${Math.min(100, (s.bookings || 0) * 10)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
