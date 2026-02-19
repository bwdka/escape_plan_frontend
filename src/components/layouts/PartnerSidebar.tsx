'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tent, Calendar, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/partner/dashboard' },
  { icon: Tent, label: 'My Listings', href: '/partner/listings' },
  { icon: Calendar, label: 'Calendar', href: '/partner/calendar' },
  { icon: Settings, label: 'Settings', href: '/partner/settings' },
];

export function PartnerSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="w-64 glass border-r border-primary/10 min-h-screen flex flex-col fixed left-0 top-0 h-full z-30">
      <div className="h-20 flex items-center px-8 border-b border-primary/5 bg-primary/5">
        <span className="font-black text-xl tracking-tighter text-primary">Escape <span className="text-accent">Partner.</span></span>
      </div>
      
      <div className="flex-1 py-10 flex flex-col gap-2 px-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1" 
                  : "text-primary/50 hover:bg-primary/5 hover:text-primary hover:translate-x-1"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-primary/5">
        <button 
            onClick={() => logout()}
            className="flex items-center gap-4 px-4 py-3.5 w-full text-left text-xs font-black uppercase tracking-widest text-red-600/70 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300 group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
