export function Hero() {
  return (
    <header className="relative h-[60vh] min-h-[500px] flex items-center justify-center bg-black text-white bg-[url('https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center bg-no-repeat overlay-hero">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">Plan your Escape</h1>
        <p className="text-xl md:text-2xl font-light text-gray-100">Before Deadline approach you.</p>
      </div>
    </header>
  );
}
