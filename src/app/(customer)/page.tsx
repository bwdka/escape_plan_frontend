'use client';

import { useState } from "react";
import { Hero } from "@/components/features/home/Hero";
import { SearchSection } from "@/components/features/home/SearchSection";
import { CategoryTabs } from "@/components/features/home/CategoryTabs";
import { GlampingGrid } from "@/components/features/home/GlampingGrid";
import { StatsSection } from "@/components/features/home/StatsSection";
import { FeaturesSection } from "@/components/features/home/FeaturesSection";
import { useGlampings } from "@/hooks/useGlampings";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("Glamping");

  const { data, isLoading } = useGlampings({
     vibe: selectedCategory === "All" ? undefined : selectedCategory.toLowerCase()
  });

  const glampings = data?.data || [];
  
  const filteredPopular = glampings.slice(0, 4);
  const exploreMore = glampings.slice(4, 8);

  return (
    <div className="pb-20 overflow-x-hidden">
      <Hero />
      <SearchSection />
      
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
            title={`${selectedCategory} Stays Popular Right Now`} 
            glampings={filteredPopular} 
          />
          
          <StatsSection />
          
          <FeaturesSection />
          
          {exploreMore.length > 0 && (
            <GlampingGrid 
                title="Explore Other Stays" 
                glampings={exploreMore} 
            />
          )}
        </div>
      )}
    </div>
  );
}
