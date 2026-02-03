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
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col fixed left-0 top-0 h-full">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-bold text-lg text-primary">Escape Partner</span>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-1 px-3">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t">
        <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
