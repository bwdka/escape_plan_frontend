'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Tent, Calendar, Settings, LogOut, X } from 'lucide-react';
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
  { icon: Settings, label: { id: 'Pengaturan', en: 'Settings' }, href: '/partner/settings' },
];

export function PartnerSidebar({ isOpen = false, onClose }: PartnerSidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const { t } = useI18n();

  return (
    <aside
      className={cn(
        "w-64 glass border-r border-primary/10 min-h-screen flex flex-col fixed left-0 top-0 h-full z-30 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-primary/5 bg-primary/5">
        <span className="font-black text-xl tracking-tighter text-primary">Escape <span className="text-accent">Partner.</span></span>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="md:hidden h-9 w-9 rounded-full border border-primary/10 bg-white/70 text-primary flex items-center justify-center"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
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
              {t(item.label)}
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
          {t({ id: 'Keluar', en: 'Sign Out' })}
        </button>
      </div>
    </aside>
  );
}
