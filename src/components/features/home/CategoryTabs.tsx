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
    <section className="container mx-auto px-4 mt-16">
        <div className="flex gap-4 overflow-x-auto pb-4 justify-start md:justify-center no-scrollbar p-2 rounded-full">
            {categories.map((cat, idx) => (
                <div 
                    key={idx} 
                    onClick={() => onSelectCategory(cat.value)}
                    className={`flex flex-col items-center gap-2 cursor-pointer min-w-[100px] px-4 py-3 rounded-2xl transition-all duration-300 group
                        ${selectedCategory === cat.value 
                            ? 'bg-white/60 backdrop-blur-md shadow-sm border border-white/40 opacity-100' 
                            : 'opacity-50 hover:opacity-100 hover:bg-white/20'
                        }`}
                >
                    <cat.icon className={`w-5 h-5 transition-colors ${selectedCategory === cat.value ? 'text-black' : 'text-gray-700 group-hover:text-black'}`} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${selectedCategory === cat.value ? 'text-black' : 'text-gray-700 group-hover:text-black'}`}>
                        {cat.label}
                    </span>
                </div>
            ))}
        </div>
    </section>
  );
}
