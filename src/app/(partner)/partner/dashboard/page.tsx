'use client';

import { usePartnerDashboard } from "@/hooks/usePartner";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  Tent, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Settings, 
  ArrowRight, 
  AlertCircle,
  Clock,
  LogOut,
  LogIn,
  Users
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";

export default function PartnerDashboard() {
  const { data, isLoading } = usePartnerDashboard();
  const { user } = useAuthStore();

  const stats = data?.stats;
  const trends = data?.trends || [];
  const activities = data?.upcoming_activities || [];
  const alerts = data?.alerts || [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 rounded-[3rem]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-[2.5rem]" />
          <Skeleton className="h-[400px] rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  // Simple SVG Line Chart for Trends
  const maxRevenue = Math.max(...trends.map(t => t.revenue), 1000000);
  const chartPoints = trends.map((t, i) => {
    const x = (i / 6) * 100;
    const y = 100 - (t.revenue / maxRevenue) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Actionable Header */}
      <section className="relative overflow-hidden rounded-[3rem] border border-white/60 bg-white/70 p-8 sm:p-10 shadow-2xl">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,180,131,0.2),transparent_70%)] blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Selamat Datang,</p>
            <h2 className="font-display text-3xl sm:text-4xl text-primary tracking-tight capitalize">
              {user?.name || 'Partner'} Hub
            </h2>
            <p className="text-sm text-primary/60 max-w-md">
              Kendalikan performa glamping Anda dan pantau operasional hari ini secara real-time.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/partner/listings/create"
              className="group flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:scale-105 transition-all shadow-xl shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              Tambah Unit
            </Link>
            <Link 
              href="/partner/calendar"
              className="group flex items-center gap-2 bg-white border border-primary/10 text-primary px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-primary/5 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Kelola Kalender
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Alert Center */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert: any, idx: number) => (
            <div 
              key={idx}
              className={`flex items-center justify-between p-4 rounded-2xl border ${
                alert.type === 'warning' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-amber-50 border-amber-100 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">{alert.message}</p>
              </div>
              {alert.action_url && (
                <Link href={alert.action_url} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                  {alert.action_label} <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. Core Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/75 p-6 shadow-xl hover:translate-y-[-4px] transition-all">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Total Revenue</p>
              <div className="p-2 bg-emerald-50 rounded-xl">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              Rp {stats?.revenue_this_month.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
               Bulan Ini
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/75 p-6 shadow-xl hover:translate-y-[-4px] transition-all">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Occupancy</p>
              <div className="p-2 bg-blue-50 rounded-xl">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              {stats?.occupancy_rate}%
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-full">
               Live Hari Ini
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/75 p-6 shadow-xl hover:translate-y-[-4px] transition-all">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Live Listings</p>
              <div className="p-2 bg-amber-50 rounded-xl">
                <Tent className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              {stats?.active_glampings}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-full">
               Properti Aktif
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/75 p-6 shadow-xl hover:translate-y-[-4px] transition-all">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Total Bookings</p>
              <div className="p-2 bg-purple-50 rounded-xl">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              {stats?.bookings_this_month}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 w-fit px-2 py-0.5 rounded-full">
               Bulan Ini
            </div>
          </div>
        </div>
      </div>

      {/* 4. Insights & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Trend */}
        <div className="lg:col-span-2 rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-xl">
          <div className="flex justify-between items-center mb-10">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-primary">Tren Pendapatan</h3>
              <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">7 Hari Terakhir</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="text-[9px] font-black uppercase text-primary/60">Paid Revenue</span>
              </div>
            </div>
          </div>

          <div className="relative h-64 w-full">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" strokeWidth="0.1" className="text-primary/5" />
              <line x1="0" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="0.1" className="text-primary/5" />
              <line x1="0" y1="60" x2="100" y2="60" stroke="currentColor" strokeWidth="0.1" className="text-primary/5" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="currentColor" strokeWidth="0.1" className="text-primary/5" />
              
              {/* Area */}
              <polyline
                fill="none"
                stroke="#D4B483"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartPoints}
                className="drop-shadow-lg"
              />
              
              {/* Dots */}
              {trends.map((t, i) => (
                <circle 
                  key={i} 
                  cx={(i / 6) * 100} 
                  cy={100 - (t.revenue / maxRevenue) * 80} 
                  r="1.5" 
                  className="fill-accent stroke-white stroke-[0.5]" 
                />
              ))}
            </svg>
            
            <div className="flex justify-between mt-4">
              {trends.map((t, i) => (
                <div key={i} className="text-center space-y-1">
                  <p className="text-[10px] font-black text-primary/40 uppercase">{t.label}</p>
                  <p className="text-[8px] font-bold text-primary/20">{format(new Date(t.date), 'dd/MM')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Focus: Today's Guest */}
        <div className="rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-xl flex flex-col">
          <div className="mb-6 space-y-1">
            <h3 className="text-lg font-black text-primary">Operasional</h3>
            <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Tamu Hari Ini & Besok</p>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {activities.length > 0 ? (
              activities.map((act: any, idx: number) => (
                <div key={idx} className="group relative p-4 rounded-2xl border border-primary/5 bg-white/50 hover:bg-white transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {act.type === 'check-in' ? (
                          <LogIn className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <LogOut className="w-3 h-3 text-rose-600" />
                        )}
                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                          act.type === 'check-in' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {act.type}
                        </span>
                      </div>
                      <p className="text-sm font-black text-primary">{act.guest_name}</p>
                      <p className="text-[10px] font-bold text-primary/40">{act.unit_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-primary/60">{format(new Date(act.date), 'MMM dd')}</p>
                      <p className="text-[8px] font-bold text-primary/20 uppercase tracking-tighter">
                         {new Date(act.date).toDateString() === new Date().toDateString() ? 'Today' : 'Tomorrow'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="p-4 bg-primary/5 rounded-full">
                  <Users className="w-6 h-6 text-primary/20" />
                </div>
                <p className="text-xs font-bold text-primary/30 uppercase tracking-widest">Tidak ada aktifitas datang/pergi hari ini.</p>
              </div>
            )}
          </div>

          <Link 
            href="/partner/calendar" 
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
          >
            Lihat Semua Reservasi
          </Link>
        </div>
      </div>
    </div>
  );
}
