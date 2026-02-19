'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shield, FileText, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin/dashboard' },
  { icon: Users, label: 'User Management', href: '/admin/users' },
  { icon: FileText, label: 'Bookings', href: '/admin/bookings' },
  { icon: Shield, label: 'Verifications', href: '/admin/verifications' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="w-64 bg-primary text-primary-foreground min-h-screen flex flex-col fixed left-0 top-0 h-full z-30 shadow-2xl">
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <span className="font-black text-xl tracking-[0.2em]">ADMIN</span>
      </div>
      
      <div className="flex-1 py-10 flex flex-col gap-2 px-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                isActive 
                  ? "bg-white/10 text-accent shadow-inner translate-x-1" 
                  : "text-white/40 hover:bg-white/5 hover:text-white hover:translate-x-1"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

       <div className="p-6 border-t border-white/5">
        <button 
            onClick={() => logout()}
            className="flex items-center gap-4 px-4 py-3.5 w-full text-left text-[10px] font-black uppercase tracking-[0.15em] text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300 group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Logout
        </button>
      </div>
    </aside>
  );
}
