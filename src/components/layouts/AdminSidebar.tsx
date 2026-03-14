'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Shield, FileText, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n/I18nProvider';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: { id: 'Ringkasan', en: 'Overview' }, href: '/admin/dashboard' },
  { icon: Users, label: { id: 'Manajemen User', en: 'User Management' }, href: '/admin/users' },
  { icon: FileText, label: { id: 'Pemesanan', en: 'Bookings' }, href: '/admin/bookings' },
  { icon: Shield, label: { id: 'Verifikasi', en: 'Verifications' }, href: '/admin/verifications' },
];

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);
  const { t } = useI18n();

  return (
    <aside
      className={cn(
        "w-64 bg-primary text-primary-foreground min-h-screen flex flex-col fixed left-0 top-0 h-full z-30 shadow-2xl transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
        <span className="font-black text-xl tracking-[0.2em]">ADMIN</span>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="md:hidden h-9 w-9 rounded-full border border-white/10 bg-white/10 text-white flex items-center justify-center"
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
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                isActive 
                  ? "bg-white/10 text-accent shadow-inner translate-x-1" 
                  : "text-white/40 hover:bg-white/5 hover:text-white hover:translate-x-1"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.label)}
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
          {t({ id: 'Keluar', en: 'Logout' })}
        </button>
      </div>
    </aside>
  );
}
