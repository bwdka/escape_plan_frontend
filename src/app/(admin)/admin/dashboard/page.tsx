'use client';

import { useAdminStats } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, BookOpen, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 rounded-[2.5rem]" />)}
       </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[3rem] border border-white/70 bg-white/75 p-8 sm:p-10 shadow-[0_30px_60px_-40px_rgba(10,10,18,0.45)] reveal-up">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,180,131,0.4),transparent_70%)] blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(20,20,30,0.35),transparent_70%)] blur-3xl float-soft" />
        <div className="relative flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Intelligence Briefing</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-slate-900 tracking-tight">
            System Intelligence
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl">
            Live operational view of platform health, revenue, and compliance.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-xl reveal-up reveal-delay-1 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,180,131,0.35),transparent_70%)] blur-2xl" />
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Gross Revenue</p>
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <DollarSign size={16} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Rp {stats?.revenue?.total?.toLocaleString('id-ID')}
            </p>
            <div className="mt-4 h-1 w-12 bg-accent rounded-full" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-xl reveal-up reveal-delay-2 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Volume</p>
              <div className="w-8 h-8 rounded-xl bg-slate-900/10 flex items-center justify-center text-slate-900">
                <BookOpen size={16} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stats?.bookings?.total}</p>
            <p className="text-[10px] text-accent font-black uppercase mt-2">
              {stats?.bookings?.pending} Active requests
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/80 p-6 shadow-xl reveal-up reveal-delay-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Partners</p>
              <div className="w-8 h-8 rounded-xl bg-slate-900/10 flex items-center justify-center text-slate-900">
                <Users size={16} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stats?.partners?.total}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase mt-2">Verified hosts</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-accent/30 bg-gradient-to-br from-white via-white to-[#f4ecd9] p-6 shadow-xl ring-1 ring-accent/10 reveal-up reveal-delay-3 hover:-translate-y-1 hover:shadow-2xl transition-all duration-500">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] text-accent font-black uppercase tracking-[0.3em]">KYC Pipeline</p>
              <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                <ShieldAlert size={16} />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{stats?.partners?.pending_verification}</p>
            <p className="text-[10px] text-accent/70 font-black uppercase mt-2">Needs Attention</p>
          </div>
        </div>
      </div>
    </div>
  );
}
