'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tent, Calendar, Settings, LogOut, X, MessageCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n/I18nProvider';

interface PartnerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: { id: 'Dashboard', en: 'Dashboard' }, href: '/partner/dashboard' },
  { icon: Tent, label: { id: 'Listing Saya', en: 'My Listings' }, href: '/partner/listings' },
  { icon: Calendar, label: { id: 'Kalender', en: 'Calendar' }, href: '/partner/calendar' },
  { icon: MessageCircle, label: { id: 'Pesan', en: 'Messages' }, href: '/partner/messages' },
  { icon: BarChart3, label: { id: 'Analitik', en: 'Analytics' }, href: '/partner/analytics' },
  { icon: Settings, label: { id: 'Pengaturan', en: 'Settings' }, href: '/partner/settings' },
];

export function PartnerSidebar({ isOpen = false, onClose }: PartnerSidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const { t } = useI18n();

  return (
    <aside
      className={cn(
        "w-72 border-r border-white/10 min-h-screen flex flex-col fixed left-0 top-0 h-full z-30 transition-transform duration-300 bg-gradient-to-b from-[#0f2a1d] via-[#143326] to-[#0b1c14] text-white shadow-2xl",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-20 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(212,180,131,0.35),transparent_70%)] blur-3xl" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(1px_1px_at_12px_12px,rgba(255,255,255,0.2),transparent_0)] [background-size:20px_20px]" />
      </div>

      <div className="relative h-24 flex items-center justify-between px-6 border-b border-white/10">
        <div>
          <span className="font-display text-2xl tracking-tight text-white">Escape Plan</span>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mt-1">Partner Studio</p>
        </div>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="md:hidden h-9 w-9 rounded-full border border-white/20 bg-white/10 text-white flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <div className="relative flex-1 py-10 flex flex-col gap-2 px-4">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-300",
                isActive 
                  ? "bg-white/15 text-white shadow-xl shadow-black/20 translate-x-1 ring-1 ring-white/20" 
                  : "text-white/60 hover:bg-white/10 hover:text-white hover:translate-x-1"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full transition-all", isActive ? "bg-accent" : "bg-white/30 group-hover:bg-white/60")} />
              <item.icon className="h-4 w-4" />
              {t(item.label)}
            </Link>
          );
        })}
      </div>

      <div className="relative p-6 border-t border-white/10">
        <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-[11px] font-black uppercase tracking-[0.25em] text-red-200/80 hover:bg-red-500/15 hover:text-red-100 rounded-2xl transition-all duration-300 group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          {t({ id: 'Keluar', en: 'Sign Out' })}
        </button>
      </div>
    </aside>
  );
}
