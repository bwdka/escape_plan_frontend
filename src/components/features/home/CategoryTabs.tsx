'use client';

import { Tent, Home, Trees, Mountain, Waves, Umbrella } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const categories = [
    { icon: Tent, label: { id: 'Glamping', en: 'Glamping' }, value: 'Glamping' },
    { icon: Home, label: { id: 'Kabin', en: 'Cabins' }, value: 'Cabin' },
    { icon: Trees, label: { id: 'Rumah Pohon', en: 'Treehouse' }, value: 'Treehouse' },
    { icon: Mountain, label: { id: 'Pegunungan', en: 'Mountain' }, value: 'Mountain' },
    { icon: Waves, label: { id: 'Tepi Danau', en: 'Lakeside' }, value: 'Lakeside' },
    { icon: Umbrella, label: { id: 'Pantai', en: 'Beach' }, value: 'Beach' },
];

interface CategoryTabsProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const { t } = useI18n();
  
  return (
    <section className="container mx-auto px-4 mt-8 mb-12 relative z-20 flex justify-center">
      <div className="p-2 glass rounded-full flex gap-2 overflow-x-auto no-scrollbar max-w-full shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-white/20">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.value;
          
          return (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={cn(
                "relative flex items-center gap-2 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 rounded-full transition-colors min-w-max",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-primary rounded-full shadow-lg shadow-primary/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <cat.icon className="w-4 h-4 relative z-10" strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-wider relative z-10">
                {t(cat.label) as string}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
