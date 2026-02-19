'use client';

import { useAdminStats } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, DollarSign, BookOpen, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
       </div>
    );
  }

  return (
    <div className="space-y-10">
        <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-black text-primary tracking-tighter">System Intelligence</h2>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Platform performance overview</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="glass p-8 rounded-[2.5rem] border-white/40 shadow-xl">
                <div className="flex justify-between items-start">
                    <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">Gross Revenue</p>
                    <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><DollarSign size={16} /></div>
                </div>
                <p className="text-2xl md:text-3xl font-black mt-4 text-primary tracking-tight">Rp {stats?.revenue?.total?.toLocaleString('id-ID')}</p>
                <div className="mt-4 h-1 w-12 bg-accent rounded-full" />
            </div>

             <div className="glass p-8 rounded-[2.5rem] border-white/40 shadow-xl">
                <div className="flex justify-between items-start">
                    <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">Volume</p>
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><BookOpen size={16} /></div>
                </div>
                <p className="text-2xl md:text-3xl font-black mt-4 text-primary tracking-tight">{stats?.bookings?.total}</p>
                <p className="text-[10px] text-accent font-black uppercase mt-2">{stats?.bookings?.pending} Active requests</p>
            </div>

             <div className="glass p-8 rounded-[2.5rem] border-white/40 shadow-xl">
                <div className="flex justify-between items-start">
                    <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">Partners</p>
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Users size={16} /></div>
                </div>
                <p className="text-2xl md:text-3xl font-black mt-4 text-primary tracking-tight">{stats?.partners?.total}</p>
                <p className="text-[10px] text-primary/30 font-black uppercase mt-2">Verified hosts</p>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border-accent/20 bg-accent/5 shadow-xl ring-1 ring-accent/10">
                <div className="flex justify-between items-start">
                    <p className="text-[10px] text-accent font-black uppercase tracking-widest">KYC Pipeline</p>
                    <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent"><ShieldAlert size={16} /></div>
                </div>
                <p className="text-2xl md:text-3xl font-black mt-4 text-primary tracking-tight">{stats?.partners?.pending_verification}</p>
                <p className="text-[10px] text-accent/60 font-black uppercase mt-2">Needs Attention</p>
            </div>
        </div>
    </div>
  );
}
