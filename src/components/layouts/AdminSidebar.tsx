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
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col fixed left-0 top-0 h-full">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="font-bold text-lg tracking-wider">ADMIN</span>
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
                  ? "bg-slate-800 text-white" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>

       <div className="p-4 border-t border-slate-800">
        <button 
            onClick={() => logout()}
            className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-red-400 hover:bg-red-950/30 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
