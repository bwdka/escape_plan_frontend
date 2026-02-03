'use client';

import { useState } from "react";
import { Hero } from "@/components/features/home/Hero";
import { SearchSection } from "@/components/features/home/SearchSection";
import { CategoryTabs } from "@/components/features/home/CategoryTabs";
import { GlampingGrid } from "@/components/features/home/GlampingGrid";
import { StatsSection } from "@/components/features/home/StatsSection";
import { FeaturesSection } from "@/components/features/home/FeaturesSection";

// Mock Data with Vibe
const allGlampings = [
    { name: "Rancabali, Bandung", location: "Lakeside glamping with stunning sunrise views.", price: 1200000, rating: 4.92, thumbnail: "https://images.unsplash.com/photo-1534069818817-f58c42a27546?auto=format&fit=crop&w=800&q=80", slug: "rancabali-bandung", vibe: "Lakeside" },
    { name: "Cisarua, Bogor", location: "Lush mountain retreats for a refreshing getaway.", price: 950000, rating: 4.88, thumbnail: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80", slug: "cisarua-bogor", vibe: "Mountain" },
    { name: "Kintamani, Bali", location: "Magical nights with a direct view of Mount Batur.", price: 1500000, rating: 4.95, thumbnail: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80", slug: "kintamani-bali", vibe: "Mountain" },
    { name: "Ciwidey, Bandung", location: "Family-friendly glamping with strawberry fields nearby.", price: 1100000, rating: 4.85, thumbnail: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80", slug: "ciwidey-bandung", vibe: "Glamping" },
    { name: "Puncak, Bogor", location: "A classic mountain escape with modern comforts.", price: 850000, rating: 4.80, thumbnail: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80", slug: "puncak-bogor", vibe: "Cabin" },
    { name: "Lembang, Bandung", location: "Cool pine forest atmosphere with unique tent designs.", price: 1350000, rating: 4.90, thumbnail: "https://images.unsplash.com/photo-1496545672479-7f946269969c?auto=format&fit=crop&w=800&q=80", slug: "lembang-bandung", vibe: "Treehouse" },
    { name: "Nusa Penida, Bali", location: "Cliffside cabins with endless ocean horizon.", price: 2100000, rating: 4.98, thumbnail: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80", slug: "nusa-penida", vibe: "Beach" },
    { name: "Situ Gunung, Sukabumi", location: "Suspension bridge access to deep forest pods.", price: 1750000, rating: 4.91, thumbnail: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80", slug: "situ-gunung", vibe: "Treehouse" },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("Glamping");

  // Filter logic: In a real app, this might fetch new data or filter a larger client-side dataset
  // For this prototype, we filter the static list.
  // We want to show items matching the vibe, or fallback to 'Popular' mix if "All" (though categories are specific here)
  
  // Let's make "Popular" section filterable
  const filteredPopular = allGlampings.filter(item => item.vibe === selectedCategory);
  
  // For "Explore More", let's show items that are NOT the selected category to give variety, or just random
  const exploreMore = allGlampings.filter(item => item.vibe !== selectedCategory);

  return (
    <div className="pb-20">
      <Hero />
      <SearchSection />
      
      <CategoryTabs 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />
      
      <GlampingGrid 
        title={`${selectedCategory} Stays Popular Right Now`} 
        glampings={filteredPopular.length > 0 ? filteredPopular : allGlampings.slice(0, 4)} 
      />
      
      <StatsSection />
      
      <FeaturesSection />
      
      <GlampingGrid 
        title="Explore Other Stays" 
        glampings={exploreMore.slice(0, 4)} 
      />
    </div>
  );
}
