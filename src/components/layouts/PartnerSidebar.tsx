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

const sidebarGroups = [
  {
    group: { id: 'Ikhtisar', en: 'Overview' },
    items: [
      { icon: LayoutDashboard, label: { id: 'Dashboard', en: 'Dashboard' }, href: '/partner/dashboard' },
    ]
  },
  {
    group: { id: 'Operasional', en: 'Operations' },
    items: [
      { icon: Calendar, label: { id: 'Kalender', en: 'Calendar' }, href: '/partner/calendar' },
      { icon: MessageCircle, label: { id: 'Pesan', en: 'Messages' }, href: '/partner/messages' },
    ]
  },
  {
    group: { id: 'Properti', en: 'Property' },
    items: [
      { icon: Tent, label: { id: 'Listing Saya', en: 'My Listings' }, href: '/partner/listings' },
    ]
  },
  {
    group: { id: 'Finansial', en: 'Financials' },
    items: [
      { icon: BarChart3, label: { id: 'Analitik', en: 'Analytics' }, href: '/partner/analytics' },
    ]
  },
  {
    group: { id: 'Sistem', en: 'System' },
    items: [
      { icon: Settings, label: { id: 'Pengaturan', en: 'Settings' }, href: '/partner/settings' },
    ]
  }
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
      
      <div className="relative flex-1 py-6 flex flex-col gap-6 px-4 overflow-y-auto">
        {sidebarGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <p className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
              {t(group.group)}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                      isActive 
                        ? "bg-white/15 text-white shadow-xl shadow-black/20 translate-x-1 ring-1 ring-white/20" 
                        : "text-white/50 hover:bg-white/10 hover:text-white hover:translate-x-1"
                    )}
                  >
                    <item.icon className={cn("h-3.5 w-3.5 transition-all", isActive ? "text-accent" : "text-white/40 group-hover:text-white/70")} />
                    {t(item.label)}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
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
