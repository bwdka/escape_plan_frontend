'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

export function StatsSection() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const stats = [
    { label: { id: 'Penginapan Unik', en: 'Unique Stays' }, value: "500+" },
    { label: { id: 'Tamu Bahagia', en: 'Happy Guests' }, value: "50K+" },
    { label: { id: 'Destinasi', en: 'Destinations' }, value: "100+" },
    { label: { id: 'Rating Rata-rata', en: 'Average Rating' }, value: "4.9" }
  ];

  return (
    <section ref={ref} className="py-16 md:py-20 lg:py-24 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-top-left scale-110" />
        <div className="absolute -top-32 right-0 w-[420px] h-[420px] bg-accent/10 rounded-full blur-3xl" />
        
        <motion.div 
          className="container mx-auto px-4 relative z-10"
          style={{ y }}
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {stats.map((stat, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                      className={cn(
                        "relative group p-6 md:p-8 rounded-[2rem] text-center transition-all duration-500",
                        "bg-white/60 backdrop-blur-sm border border-white/30 hover:bg-white/85 hover:shadow-2xl hover:-translate-y-2"
                      )}
                    >
                        <div className="text-4xl md:text-6xl font-display font-black text-primary mb-2 tracking-tight group-hover:text-accent transition-colors">
                          {stat.value}
                        </div>
                        <div className="text-muted-foreground font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">
                          {t(stat.label)}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    </section>
  );
}
