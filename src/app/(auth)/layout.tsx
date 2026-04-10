'use client';

import { Tent } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-amber-50" />
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] bg-emerald-200/30 blur-[140px] rounded-full" />
      <div className="absolute -bottom-48 -right-32 w-[520px] h-[520px] bg-amber-200/40 blur-[160px] rounded-full" />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <div className="hidden lg:flex flex-col gap-6">
          <Link href="/" className="inline-flex items-center gap-3 text-primary">
            <Tent className="h-10 w-10" />
            <span className="text-lg font-black tracking-[0.3em] uppercase">Escape Plan</span>
          </Link>
          <div className="space-y-4">
            <h1 className="font-display text-5xl font-black tracking-tight text-primary leading-[1.05]">
              {t({ id: 'Rencanakan Pelarian Anda.', en: 'Plan Your Escape.' })}
            </h1>
            <p className="text-primary/60 text-lg font-medium max-w-md">
              {t({
                id: 'Akses pengalaman glamping terbaik, kurasi host terpercaya, dan perjalanan tanpa ribet.',
                en: 'Access premium glamping escapes, trusted hosts, and seamless journeys.'
              })}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-primary/40">
            <span className="w-12 h-px bg-primary/20" />
            {t({ id: 'Premium Outdoor Living', en: 'Premium Outdoor Living' })}
          </div>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="flex flex-col items-center lg:items-start mb-8">
            <Link href="/" className="flex items-center gap-2 text-primary mb-4 lg:hidden">
              <Tent className="h-9 w-9" />
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
