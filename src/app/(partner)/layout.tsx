'use client';

import { PartnerSidebar } from "@/components/layouts/PartnerSidebar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useI18n } from "@/i18n/I18nProvider";
import { useState } from "react";
import { Menu, Bell } from "lucide-react";
import { useNotifications, useMarkAllNotificationsRead, useClearNotifications } from "@/hooks/useNotifications";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { mutate: clearAll } = useClearNotifications();
  const unreadCount = notifications.filter((n: any) => !n.read_at).length;
  return (
    <div className="min-h-screen bg-[#f7f3ea] text-foreground relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-28 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(210,178,106,0.45),transparent_70%)] blur-3xl" />
        <div className="absolute top-[30%] -right-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(21,61,45,0.35),transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),transparent_70%)] blur-2xl" />
        <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(1px_1px_at_10px_10px,rgba(15,42,29,0.2),transparent_0)] [background-size:24px_24px]" />
      </div>
      <PartnerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu overlay"
        />
      )}
      <div className="md:ml-72 flex flex-col min-h-screen relative z-10">
        <header className="border-b border-white/60 bg-white/70 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 md:px-10 py-4 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden h-11 w-11 rounded-full border border-primary/10 bg-white/90 flex items-center justify-center shadow-sm"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-primary" />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/50">
                {t({ id: 'Partner Hub', en: 'Partner Hub' })}
              </p>
              <h1 className="font-display text-2xl md:text-3xl text-primary tracking-tight">
                {t({ id: 'Dashboard Partner', en: 'Partner Dashboard' })}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
              Live Ops
            </div>
            <div className="relative">
              <button
                type="button"
                className="relative h-10 w-10 rounded-full border border-primary/10 bg-white/80 flex items-center justify-center"
                onClick={() => setIsNotifOpen((v) => !v)}
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-primary" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/60 bg-white/90 shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-primary/10">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">Notifications</p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/50">
                        <button onClick={() => markAllRead()}>Mark all</button>
                        <span>•</span>
                        <button onClick={() => clearAll()}>Clear</button>
                      </div>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-4 text-xs text-primary/40">No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 6).map((n: any) => (
                        <div key={n.id} className="px-4 py-3 border-b border-primary/5 text-sm text-primary/80">
                          <div className="text-[10px] uppercase tracking-widest text-primary/40">{n.type}</div>
                          <div className="font-semibold">{n.data?.preview || 'New update'}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <LanguageToggle />
            <div className="h-9 w-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-black shadow-lg shadow-primary/30">
              P
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
