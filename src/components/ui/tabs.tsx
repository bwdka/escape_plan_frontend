'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

export function Tabs({ 
  defaultValue, 
  children, 
  className 
}: { 
  defaultValue: string; 
  children: React.ReactNode; 
  className?: string 
}) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ 
    className, 
    value, 
    ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        isActive 
          ? 'bg-white text-slate-950 shadow-sm' 
          : 'hover:text-slate-900',
        className
      )}
      onClick={() => context?.onValueChange(value)}
      {...props}
    />
  );
}

export function TabsContent({ 
    className, 
    value, 
    ...props 
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext);
  if (context?.value !== value) return null;

  return (
    <div
      className={cn('focus-visible:outline-none', className)}
      {...props}
    />
  );
}
