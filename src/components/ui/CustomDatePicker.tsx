'use client';

import React, { useState, useEffect, useRef } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, isSameMonth, isSameDay, isBefore, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import '@/styles/datepicker.css';

interface CustomDatePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (dates: [Date | null, Date | null]) => void;
  bookedDates?: string[];
  highSeasons?: { tanggal: string }[];
  className?: string;
  triggerClassName?: string;
}

export const CustomDatePicker = ({
  startDate,
  endDate,
  onChange,
  bookedDates = [],
  highSeasons = [],
  className,
  triggerClassName
}: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(startDate || new Date());
  const [selectingCheckin, setSelectingCheckin] = useState(true);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  
  // Local state for dates before applying
  const [tempDates, setTempDates] = useState<[Date | null, Date | null]>([startDate, endDate]);
  const [tempStartDate, tempEndDate] = tempDates;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Sync temp dates when opened and handle positioning
  useEffect(() => {
    if (isOpen) {
      setTempDates([startDate, endDate]);
      if (startDate) setViewDate(startDate);
      setSelectingCheckin(true);

      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const datepickerHeight = 550;
        const newPos = (spaceBelow < datepickerHeight && rect.top > datepickerHeight) ? 'top' : 'bottom';
        
        setPosition(prev => prev !== newPos ? newPos : prev);
      }
    }
  }, [isOpen, startDate, endDate]);

  const ID_MONTHS = ["Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"];
  const ID_DAYS_MIN = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && 
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDayClick = (date: Date) => {
    if (selectingCheckin) {
      if (tempEndDate && isAfter(date, tempEndDate)) {
        setTempDates([date, null]);
      } else {
        setTempDates([date, tempEndDate]);
      }
      setSelectingCheckin(false);
    } else {
      if (!tempStartDate) {
        setTempDates([date, null]);
        setSelectingCheckin(false);
      } else if (isBefore(date, tempStartDate)) {
        setTempDates([date, tempStartDate]);
      } else {
        setTempDates([tempStartDate, date]);
      }
    }
  };

  const handleApply = () => {
    onChange(tempDates);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempDates([null, null]);
    setSelectingCheckin(true);
  };

  const renderCalendar = (year: number, month: number) => {
    const monthStart = startOfMonth(new Date(year, month));
    const startDateOfMonth = new Date(monthStart);
    startDateOfMonth.setDate(startDateOfMonth.getDate() - monthStart.getDay());
    
    const calendarDays = [];
    const tempDate = new Date(startDateOfMonth);
    for (let i = 0; i < 42; i++) {
      calendarDays.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div className="dp-calendar">
        <div className="dp-title">{ID_MONTHS[month]} {year}</div>
        <div className="dp-week">
          {ID_DAYS_MIN.map(d => <div key={d} className="dp-weekday">{d}</div>)}
        </div>
        <div className="dp-days">
          {calendarDays.map((date, idx) => {
            const isOut = !isSameMonth(date, monthStart);
            const dateStr = format(date, 'yyyy-MM-dd');
            const isBooked = bookedDates.includes(dateStr);
            const isToday = isSameDay(date, today);
            const isSelectedCheckin = tempStartDate && isSameDay(date, tempStartDate);
            const isSelectedCheckout = tempEndDate && isSameDay(date, tempEndDate);
            const isInRange = tempStartDate && tempEndDate && isAfter(date, tempStartDate) && isBefore(date, tempEndDate);
            const isPast = isBefore(date, today);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isHigh = highSeasons.some(s => isSameDay(new Date(s.tanggal), date));

            return (
              <button
                key={idx}
                type="button"
                disabled={isPast || isBooked}
                className={cn(
                  "dp-day",
                  isOut && "out",
                  isToday && "today",
                  isSelectedCheckin && "selected checkin",
                  isSelectedCheckout && "selected checkout",
                  isInRange && "in-range",
                  isBooked && "booked",
                  isWeekend && "weekend",
                  isHigh && "high-season"
                )}
                onClick={() => handleDayClick(date)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonthView = addMonths(viewDate, 1);

  return (
    <div className={cn("relative flex flex-col items-stretch", className)}>
      <div 
        ref={triggerRef}
        className={cn("flex flex-col justify-center px-6 py-4 cursor-pointer hover:bg-black/5 transition-colors", triggerClassName)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-primary/40 mb-1 text-left cursor-pointer">When?</label>
        <div className={cn(
          "text-sm md:text-base font-black transition-colors text-left",
          startDate ? "text-primary" : "text-primary/30"
        )}>
          {startDate ? (
            <>
              {format(startDate, 'MMM d')}
              <span className="mx-2 text-accent opacity-50">—</span>
              {endDate ? format(endDate, 'MMM d') : 'Add dates'}
            </>
          ) : (
            'Select stay dates'
          )}
        </div>
      </div>

      {isOpen && (
        <div 
          ref={containerRef}
          className={cn("datepicker open", position === 'top' ? "pos-top" : "pos-bottom")}
          style={{ 
            top: position === 'bottom' ? 'calc(100% + 1rem)' : 'auto',
            bottom: position === 'top' ? 'calc(100% + 1rem)' : 'auto',
          }}
        >
          <div className="dp-header">
            <div className="dp-nav-container">
              <button className="dp-nav-btn" onClick={() => setViewDate(subMonths(viewDate, 1))}>◀</button>
              <div className="dp-mode-toggle">
                <button 
                  className={cn("mode-btn", selectingCheckin && "active")}
                  onClick={() => setSelectingCheckin(true)}
                >
                  Check-in
                </button>
                <button 
                  className={cn("mode-btn", !selectingCheckin && "active")}
                  onClick={() => setSelectingCheckin(false)}
                >
                  Check-out
                </button>
              </div>
              <button className="dp-nav-btn" onClick={() => setViewDate(addMonths(viewDate, 1))}>▶</button>
            </div>
          </div>
          <div className="dp-calendars">
            {renderCalendar(viewDate.getFullYear(), viewDate.getMonth())}
            {renderCalendar(nextMonthView.getFullYear(), nextMonthView.getMonth())}
          </div>
          <div className="dp-footer">
            <button className="dp-btn clear-btn" onClick={handleClear}>Clear</button>
            <button className="dp-btn apply-btn" onClick={handleApply}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};
