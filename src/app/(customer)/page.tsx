'use client';

import { useState } from "react";
import { Hero } from "@/components/features/home/Hero";
import { SearchSection } from "@/components/features/home/SearchSection";
import { CategoryTabs } from "@/components/features/home/CategoryTabs";
import { GlampingGrid } from "@/components/features/home/GlampingGrid";
import { StatsSection } from "@/components/features/home/StatsSection";
import { FeaturesSection } from "@/components/features/home/FeaturesSection";
import { useGlampings } from "@/hooks/useGlampings";
import { useI18n } from "@/i18n/I18nProvider";
import Link from "next/link";
import { Compass, ShieldCheck, Timer } from "lucide-react";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("Glamping");
  const { t } = useI18n();

  const { data, isLoading } = useGlampings({
     vibe: selectedCategory === "All" ? undefined : selectedCategory.toLowerCase()
  });

  const glampings = data?.data || [];
  
  const filteredPopular = glampings.slice(0, 4);
  const exploreMore = glampings.slice(4, 8);

  return (
    <div className="-mt-28 pb-20 overflow-x-hidden relative">
      <div className="ambient-orb absolute -top-24 right-[-120px] h-[320px] w-[320px] rounded-full bg-accent/40" />
      <div className="ambient-orb float-slow absolute top-[40vh] left-[-120px] h-[260px] w-[260px] rounded-full bg-primary/30" />
      <Hero />
      <SearchSection />
      <section className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {
              icon: Compass,
              title: t({ id: "Pilih Sesuai Mood", en: "Pick by Mood" }),
              desc: t({ id: "Filter cepat berdasarkan vibe dan kebutuhan perjalananmu.", en: "Use quick filters based on your travel vibe and needs." }),
            },
            {
              icon: ShieldCheck,
              title: t({ id: "Properti Terkurasi", en: "Curated Properties" }),
              desc: t({ id: "Daftar pilihan dengan rating tinggi dan host terverifikasi.", en: "Browse top-rated choices with verified hosts." }),
            },
            {
              icon: Timer,
              title: t({ id: "Booking Lebih Cepat", en: "Faster Booking" }),
              desc: t({ id: "Flow pencarian ke checkout dirancang minim friksi.", en: "Search-to-checkout flow is designed to reduce friction." }),
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[2rem] bg-white/80 border border-primary/10 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-primary tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm font-bold text-primary/60">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center">
          <Link
            href="/search"
            className="rounded-full bg-primary text-primary-foreground px-6 py-3 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            {t({ id: "Mulai Cari Escape", en: "Start Finding Escapes" })}
          </Link>
        </div>
      </section>
      
      <CategoryTabs 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      {isLoading ? (
        <div className="container mx-auto px-4 mt-16 text-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="h-8 w-64 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-xl"></div>)}
                </div>
            </div>
        </div>
      ) : (
        <div key={selectedCategory} className="animate-fade-up">
          <GlampingGrid 
            title={t({ id: `${selectedCategory} Populer Saat Ini`, en: `${selectedCategory} Stays Popular Right Now` })} 
            glampings={filteredPopular} 
          />
          
          <StatsSection />
          
          <FeaturesSection />
          
          {exploreMore.length > 0 && (
            <GlampingGrid 
                title={t({ id: 'Jelajahi Penginapan Lainnya', en: 'Explore Other Stays' })} 
                glampings={exploreMore} 
            />
          )}
        </div>
      )}
    </div>
  );
}
