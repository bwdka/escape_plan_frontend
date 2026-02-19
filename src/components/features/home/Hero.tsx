export function Hero() {
  return (
    <header className="relative h-[75vh] min-h-[600px] flex items-center justify-center text-white bg-[url('https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-no-repeat overflow-hidden">
      {/* Dynamic Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/20 to-background" />
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-6">
        <div className="inline-block glass px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-white/90 mb-4 animate-fade-up">
            Premium Outdoor Experiences
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black mb-4 tracking-tighter leading-[0.9] drop-shadow-2xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
          PLAN YOUR <br /> 
          <span className="text-accent drop-shadow-none">ESCAPE.</span>
        </h1>
        <p className="text-lg md:text-2xl font-medium text-white/80 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
          Discover curated glamping sites that redefine nature luxury. 
          Unplug from the noise, reconnect with the wild.
        </p>
      </div>

      {/* Floating Elements for "Liquid" feel */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
    </header>
  );
}
