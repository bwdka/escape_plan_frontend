'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export function Hero() {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <header 
      ref={ref}
      className="relative h-[75vh] sm:h-[85vh] min-h-[500px] sm:min-h-[650px] flex items-center justify-center text-white overflow-hidden"
    >
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_40%)]" />
      </motion.div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center -mt-12 sm:-mt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 }
            }
          }}
          className="max-w-5xl mx-auto flex flex-col items-center gap-4 sm:gap-6"
        >
          {/* Badge */}
          <motion.div 
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
            }}
            className="inline-flex items-center gap-3 glass px-5 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-white/90 backdrop-blur-md border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
          >
            <span className="w-1 h-1 rounded-full bg-accent animate-pulse shadow-[0_0_10px_var(--accent)]" />
            {t({ id: 'Pengalaman Outdoor Premium', en: 'Premium Outdoor Experiences' })}
          </motion.div>

          {/* Heading */}
          <div className="overflow-hidden py-2">
            <motion.h1 
              variants={{
                hidden: { y: "100%" },
                visible: { y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] leading-[0.9] sm:leading-[0.85] text-balance drop-shadow-2xl"
            >
              PLAN YOUR
              <br />
              <span className="text-accent italic font-serif pr-2 mix-blend-screen opacity-90">ESCAPE</span>
            </motion.h1>
          </div>

          {/* Subheading */}
          <motion.p 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="font-body text-sm sm:text-base md:text-xl font-medium text-white/80 max-w-xl mx-auto text-balance leading-relaxed tracking-wide"
          >
            {t({
              id: 'Sebelum deadline mendekat, rencanakan pelarianmu.',
              en: 'Before the deadlines approach, plan your escape.'
            })}
          </motion.p>

          {/* Buttons */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="flex flex-col sm:flex-row gap-4 pt-4 w-full justify-center"
          >
            <Link
              href="/search"
              className="group relative px-8 py-4 bg-accent text-accent-foreground rounded-full text-xs font-black uppercase tracking-[0.2em] overflow-hidden transition-transform hover:scale-105 shadow-[0_0_60px_-10px_rgba(212,180,131,0.7)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t({ id: 'Jelajahi Sekarang', en: 'Explore Now' })}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            
            <Link
              href="/partner/register"
              className="group px-8 py-4 glass text-white rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all hover:scale-105 border border-white/20 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              {t({ id: 'Jadi Host', en: 'Become a Host' })}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 flex flex-col items-center gap-3 cursor-pointer z-20"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
      </motion.div>
    </header>
  );
}
