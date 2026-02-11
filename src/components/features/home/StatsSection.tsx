export function StatsSection() {
  return (
    <section className="py-16 mt-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "Unique Stays", value: "500+" },
                    { label: "Happy Guests", value: "50K+" },
                    { label: "Destinations", value: "100+" },
                    { label: "Average Rating", value: "4.9" }
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white/40 backdrop-blur-xl backdrop-saturate-150 border border-white/40 shadow-xl text-center hover:scale-105 transition-all duration-500">
                        <div className="text-4xl font-extrabold text-black mb-2 tracking-tight">{stat.value}</div>
                        <div className="text-gray-600 font-semibold text-sm uppercase tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
}
