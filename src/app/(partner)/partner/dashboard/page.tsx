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
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-[2.5rem]" />)}
       </div>
    );
  }

  return (
    <div className="space-y-10">
        <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-primary tracking-tighter">Command Center</h2>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Property performance & analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="glass p-8 rounded-[2.5rem] border-white/40 shadow-xl overflow-hidden relative group hover:bg-white/60 transition-all duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-3xl -mr-8 -mt-8" />
                <div className="relative">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Monthly Revenue</p>
                        <DollarSign className="h-4 w-4 text-accent" />
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">Rp {stats?.revenue_this_month.toLocaleString('id-ID')}</div>
                    <p className="text-[10px] font-bold text-emerald-600 mt-2">+20.1% from last month</p>
                </div>
            </div>

             <div className="glass p-8 rounded-[2.5rem] border-white/40 shadow-xl overflow-hidden relative group hover:bg-white/60 transition-all duration-500">
                <div className="relative">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Active Bookings</p>
                        <Calendar className="h-4 w-4 text-primary/60" />
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">{stats?.bookings_this_month}</div>
                    <p className="text-[10px] font-bold text-primary/30 mt-2">New requests this month</p>
                </div>
            </div>

             <div className="glass p-8 rounded-[2.5rem] border-white/40 shadow-xl overflow-hidden relative group hover:bg-white/60 transition-all duration-500">
                <div className="relative">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Live Properties</p>
                        <Tent className="h-4 w-4 text-primary/60" />
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">{stats?.active_glampings}</div>
                    <p className="text-[10px] font-bold text-primary/30 mt-2">Verified & active</p>
                </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border-accent/20 bg-accent/5 shadow-xl overflow-hidden relative group hover:bg-white/60 transition-all duration-500 ring-1 ring-accent/10">
                <div className="relative">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent">Arrivals</p>
                        <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-primary tracking-tight">{stats?.upcoming_checkins}</div>
                    <p className="text-[10px] font-bold text-accent/60 mt-2">Next 7 days</p>
                </div>
            </div>
        </div>
    </div>
  );
}