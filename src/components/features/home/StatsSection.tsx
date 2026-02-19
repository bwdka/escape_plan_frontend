export function StatsSection() {
  return (
    <section className="py-20 mt-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { label: "Unique Stays", value: "500+" },
                    { label: "Happy Guests", value: "50K+" },
                    { label: "Destinations", value: "100+" },
                    { label: "Average Rating", value: "4.9" }
                ].map((stat, i) => (
                    <div key={i} className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-center hover:scale-105 hover:bg-white/50 transition-all duration-700 group">
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary mb-2 md:mb-3 tracking-tighter group-hover:text-accent transition-colors">{stat.value}</div>
                        <div className="text-primary/40 font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em]">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
}
