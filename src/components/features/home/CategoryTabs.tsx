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
        <div className="flex gap-8 overflow-x-auto pb-4 justify-start md:justify-center no-scrollbar">
            {categories.map((cat, idx) => (
                <div 
                    key={idx} 
                    onClick={() => onSelectCategory(cat.value)}
                    className={`flex flex-col items-center gap-2 cursor-pointer min-w-[80px] group transition-all 
                        ${selectedCategory === cat.value 
                            ? 'opacity-100 border-b-2 border-black pb-2' 
                            : 'opacity-60 hover:opacity-100 hover:border-b-2 hover:border-gray-300 pb-2'
                        }`}
                >
                    <cat.icon className={`w-6 h-6 transition-colors ${selectedCategory === cat.value ? 'text-black' : 'text-gray-700 group-hover:text-black'}`} />
                    <span className={`text-xs font-medium transition-colors ${selectedCategory === cat.value ? 'text-black' : 'text-gray-700 group-hover:text-black'}`}>
                        {cat.label}
                    </span>
                </div>
            ))}
        </div>
    </section>
  );
}
