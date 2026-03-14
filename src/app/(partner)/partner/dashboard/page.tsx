'use client';

import { usePartnerDashboard } from "@/hooks/usePartner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Tent, Calendar, TrendingUp } from "lucide-react";

export default function PartnerDashboard() {
  const { data: stats, isLoading } = usePartnerDashboard();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 rounded-[2.5rem]" />)}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[3rem] border border-white/60 bg-white/70 p-8 sm:p-10 shadow-[0_30px_60px_-40px_rgba(12,24,18,0.45)]">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,180,131,0.45),transparent_70%)] blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-52 w-52 rounded-full bg-[radial-gradient(circle_at_center,rgba(20,50,36,0.35),transparent_70%)] blur-3xl" />
        <div className="relative flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/50">Performance Briefing</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-primary tracking-tight">
            Command Center
          </h2>
          <p className="text-sm sm:text-base text-primary/60 max-w-xl">
            Real-time revenue, bookings, and supply signals in one live cockpit.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/75 p-6 shadow-xl">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,180,131,0.35),transparent_70%)] blur-2xl" />
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Monthly Revenue</p>
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              Rp {stats?.revenue_this_month.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] font-bold text-emerald-700">+20.1% from last month</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/75 p-6 shadow-xl">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Active Bookings</p>
              <Calendar className="h-4 w-4 text-primary/60" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              {stats?.bookings_this_month}
            </div>
            <p className="text-[10px] font-bold text-primary/30">New requests this month</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/75 p-6 shadow-xl">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Live Properties</p>
              <Tent className="h-4 w-4 text-primary/60" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              {stats?.active_glampings}
            </div>
            <p className="text-[10px] font-bold text-primary/30">Verified & active</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-accent/30 bg-gradient-to-br from-white via-white to-[#f4ecd9] p-6 shadow-xl ring-1 ring-accent/10">
          <div className="relative space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Arrivals</p>
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
            <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">
              {stats?.upcoming_checkins}
            </div>
            <p className="text-[10px] font-bold text-accent/70">Next 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
