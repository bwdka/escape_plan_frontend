'use client';

import { useState, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  startDate: Date | null;
  endDate: Date | null;
}

// Custom Input for the DatePicker to show two separate fields
const CustomDateInput = forwardRef<HTMLDivElement, CustomInputProps>(({ onClick, startDate, endDate }, ref) => (
  <div 
      className="flex flex-1 items-stretch divide-x md:divide-x border-b md:border-b-0 md:border-r border-gray-100 cursor-pointer" 
      onClick={onClick} 
      ref={ref}
  >
     <div className="flex-1 px-4 py-3 md:py-0 flex flex-col justify-center">
        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary mb-1">Check in</label>
        <span className={`text-sm md:text-base font-medium ${startDate ? 'text-gray-900' : 'text-gray-400'}`}>
          {startDate ? format(startDate, 'MMM d') : 'Add dates'}
        </span>
     </div>
     <div className="flex-1 px-4 py-3 md:py-0 flex flex-col justify-center">
        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary mb-1">Check out</label>
        <span className={`text-sm md:text-base font-medium ${endDate ? 'text-gray-900' : 'text-gray-400'}`}>
          {endDate ? format(endDate, 'MMM d') : 'Add dates'}
        </span>
     </div>
  </div>
));
CustomDateInput.displayName = 'CustomDateInput';

export function SearchSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [guests, setGuests] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (startDate) params.set('check_in', startDate.toISOString().split('T')[0]);
    if (endDate) params.set('check_out', endDate.toISOString().split('T')[0]);
    if (guests) params.set('guests', guests);
    
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative -mt-10 md:-mt-8 z-20 container mx-auto px-4">
      <Card className="bg-white/70 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl md:rounded-full shadow-2xl border-white/50 p-2 md:pl-8 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4 max-w-5xl mx-auto overflow-hidden">
        {/* Location */}
        <div className="flex-1 flex flex-col justify-center px-4 py-3 md:py-0 border-b md:border-b-0 md:border-r border-gray-100">
            <label htmlFor="location" className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary mb-1">Where</label>
            <input 
                type="text" 
                id="location" 
                placeholder="Search destinations" 
                className="w-full outline-none text-sm md:text-base text-gray-900 placeholder-gray-400 font-medium bg-transparent"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />
        </div>
        
        {/* Combined Date Picker Triggering Custom Input */}
        <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            customInput={<CustomDateInput startDate={startDate} endDate={endDate} />}
            minDate={new Date()}
            monthsShown={2}
            shouldCloseOnSelect={false}
        />

        {/* Guests */}
        <div className="flex-1 flex flex-col justify-center px-4 py-3 md:py-0">
             <label htmlFor="guests" className="block text-[10px] md:text-xs font-bold uppercase tracking-wider text-primary mb-1">Total Guests</label>
             <input 
                type="number" 
                id="guests" 
                placeholder="Add guests" 
                className="w-full outline-none text-sm md:text-base text-gray-900 placeholder-gray-400 font-medium bg-transparent"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                min="1"
            />
        </div>

        {/* Search Button */}
        <button 
            onClick={handleSearch}
            className="bg-black hover:bg-gray-800 text-white rounded-xl md:rounded-full py-4 md:px-8 md:py-5 flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
        >
            <FaSearch className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-bold text-sm md:text-base md:hidden">Search Destinations</span>
        </button>
      </Card>
    </section>
  );
}