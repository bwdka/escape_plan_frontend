'use client';

import { useEffect, useState } from 'react';

export function StatsSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="py-20 mt-20 relative overflow-hidden">
        {/* Parallax Decorative Elements */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px]"
          style={{ transform: `translateY(${(scrollY - 1000) * 0.2}px)` }}
        />
        <div 
          className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]"
          style={{ transform: `translateY(${(scrollY - 1000) * -0.1}px)` }}
        />

        <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: "Unique Stays", value: "500+" },
                    { label: "Happy Guests", value: "50K+" },
                    { label: "Destinations", value: "100+" },
                    { label: "Average Rating", value: "4.9" }
                ].map((stat, i) => (
                    <div 
                      key={i} 
                      className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-center hover:scale-105 hover:bg-white/50 transition-all duration-700 group"
                      style={{ 
                        transform: `translateY(${(scrollY - 1200) * (0.02 * (i + 1))}px)` 
                      }}
                    >
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary mb-2 md:mb-3 tracking-tighter group-hover:text-accent transition-colors">{stat.value}</div>
                        <div className="text-primary/40 font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em]">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
}
