'use client';

import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { useI18n } from "@/i18n/I18nProvider";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu overlay"
        />
      )}
      <div className="md:ml-64 flex flex-col min-h-screen">
         <header className="bg-white border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 md:px-8 py-3 md:py-0 md:h-16 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="md:hidden h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center"
                  onClick={() => setIsSidebarOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-slate-700" />
                </button>
                <h1 className="font-semibold text-lg text-slate-800">{t({ id: 'Pusat Kontrol Admin', en: 'Admin Control Center' })}</h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
                 <LanguageToggle />
                 <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    A
                </div>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
