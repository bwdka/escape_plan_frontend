'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  showLabel?: boolean;
  positionOverride?: 'top' | 'bottom' | 'center';
}

export const CustomDatePicker = ({
  startDate,
  endDate,
  onChange,
  bookedDates = [],
  highSeasons = [],
  className,
  triggerClassName,
  showLabel = true,
  positionOverride
}: CustomDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(startDate || new Date());
  const [selectingCheckin, setSelectingCheckin] = useState(true);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const [isMobile, setIsMobile] = useState(false);
  
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

      if (positionOverride && positionOverride !== 'center') {
        setPosition(positionOverride);
        return;
      }

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

  const isBookedDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookedDates.includes(dateStr);
  };

  const hasBookedBetween = (start: Date, end: Date) => {
    const s = new Date(start);
    const e = new Date(end);
    if (e <= s) return false;
    return bookedDates.some((d) => {
      const bd = new Date(d);
      return bd > s && bd < e;
    });
  };

  const getNextBookedAfterStart = (start: Date) => {
    const s = new Date(start);
    const future = bookedDates
      .map((d) => new Date(d))
      .filter((d) => d > s)
      .sort((a, b) => a.getTime() - b.getTime());
    return future.length ? future[0] : null;
  };

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

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  const handleDayClick = (date: Date) => {
    const booked = isBookedDate(date);
    let nextStart: Date | null = tempStartDate;
    let nextEnd: Date | null = tempEndDate;
    if (selectingCheckin) {
      if (booked) return;
      nextStart = date;
      nextEnd = null;
      setSelectingCheckin(false);
    } else {
      if (!tempStartDate) {
        if (booked) return;
        nextStart = date;
        nextEnd = null;
        setSelectingCheckin(false);
      } else if (isBefore(date, tempStartDate)) {
        if (booked) return;
        nextStart = date;
        nextEnd = tempStartDate;
      } else if (isSameDay(date, tempStartDate)) {
        return;
      } else {
        if (hasBookedBetween(tempStartDate, date)) return;
        nextStart = tempStartDate;
        nextEnd = date;
      }
    }
    setTempDates([nextStart, nextEnd]);
    if (nextStart && nextEnd) {
      onChange([nextStart, nextEnd]);
      setIsOpen(false);
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
            const canUseAsCheckout =
              !selectingCheckin &&
              tempStartDate &&
              isAfter(date, tempStartDate) &&
              !hasBookedBetween(tempStartDate, date);
            const isBookedButCheckoutAllowed = isBooked && canUseAsCheckout;
            const nextBooked = tempStartDate ? getNextBookedAfterStart(tempStartDate) : null;
            const isAfterNextBooked =
              !selectingCheckin &&
              tempStartDate &&
              nextBooked &&
              isAfter(date, nextBooked);

            return (
              <button
                key={idx}
                type="button"
                disabled={isPast || (isBooked && !canUseAsCheckout)}
                className={cn(
                  "dp-day",
                  isOut && "out",
                  isToday && "today",
                  isSelectedCheckin && "selected checkin",
                  isSelectedCheckout && "selected checkout",
                  isInRange && "in-range",
                  isBooked && !isBookedButCheckoutAllowed && "booked",
                  isBookedButCheckoutAllowed && "booked-allowed",
                  isAfterNextBooked && "blocked-after",
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
  const showTwoMonths = positionOverride === 'center' ? !isMobile : !isMobile;

  return (
    <div className={cn("relative flex flex-col items-stretch", className)}>
      <div 
        ref={triggerRef}
        className={cn("flex flex-col justify-center px-6 py-4 cursor-pointer hover:bg-black/5 transition-colors", triggerClassName)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {showLabel && <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5 text-left cursor-pointer">Dates</label>}
        <div className={cn(
          "text-sm font-semibold transition-colors text-left",
          startDate ? "text-foreground" : "text-muted-foreground/50"
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

      {isOpen && positionOverride === 'center' && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            ref={containerRef}
            className="datepicker open pos-bottom"
            style={{ position: 'relative', display: 'block', left: 'auto', transform: 'none', width: 'min(95vw, 720px)' }}
            onClick={(e) => e.stopPropagation()}
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
              {showTwoMonths && renderCalendar(nextMonthView.getFullYear(), nextMonthView.getMonth())}
            </div>
            <div className="dp-footer">
              <button className="dp-btn clear-btn" onClick={handleClear}>Clear</button>
              <button className="dp-btn apply-btn" onClick={handleApply}>Apply</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isOpen && positionOverride !== 'center' && (
        <div 
          ref={containerRef}
          className={cn("datepicker open", position === 'top' ? "pos-top" : "pos-bottom")}
          style={{ 
            top: position === 'bottom' ? 'calc(100% + 1rem)' : 'auto',
            bottom: position === 'top' ? 'calc(100% + 1rem)' : 'auto',
            position: isMobile ? 'absolute' : undefined, // Force absolute on mobile to stay within stacking context if needed
            zIndex: 100001 // Ensure it's very high
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
            {showTwoMonths && renderCalendar(nextMonthView.getFullYear(), nextMonthView.getMonth())}
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
