'use client';

import { FaCampground, FaHome, FaTree, FaMountain, FaWater, FaUmbrellaBeach } from 'react-icons/fa';

const categories = [
    { icon: FaCampground, label: 'Glamping', value: 'Glamping' },
    { icon: FaHome, label: 'Cabins', value: 'Cabin' },
    { icon: FaTree, label: 'Treehouse', value: 'Treehouse' },
    { icon: FaMountain, label: 'Mountain', value: 'Mountain' },
    { icon: FaWater, label: 'Lakeside', value: 'Lakeside' },
    { icon: FaUmbrellaBeach, label: 'Beach', value: 'Beach' },
];

interface CategoryTabsProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  return (
    <section className="container mx-auto px-4 mt-12 relative z-20 flex justify-center">
        <div className="inline-flex max-w-full gap-3 overflow-x-auto no-scrollbar p-3 glass rounded-[2.5rem] border-white/30 shadow-2xl">
            {categories.map((cat, idx) => (
                <div 
                    key={idx} 
                    onClick={() => onSelectCategory(cat.value)}
                    className={`flex flex-col items-center gap-2 cursor-pointer min-w-[110px] px-5 py-4 rounded-[1.8rem] transition-all duration-500 group
                        ${selectedCategory === cat.value 
                            ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105' 
                            : 'text-primary/60 hover:text-primary hover:bg-white/40'
                        }`}
                >
                    <cat.icon className={`w-5 h-5 transition-transform duration-500 ${selectedCategory === cat.value ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] transition-colors`}>
                        {cat.label}
                    </span>
                </div>
            ))}
        </div>
    </section>
  );
}
