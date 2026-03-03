'use client';

import Link from 'next/link';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';

export function CustomerNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 glass border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-primary">
          Escape Plan.
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
            <Link href="/search" className="text-sm font-bold text-foreground/80 hover:text-primary transition-colors">Stays</Link>
            <Link href="#" className="text-sm font-bold text-foreground/60 hover:text-primary transition-colors">Experiences</Link>
            <Link href="/partner/register" className="text-sm font-bold text-foreground/60 hover:text-primary transition-colors">Become a host</Link>
            
            {isAuthenticated ? (
                 <div className="relative group">
                    <button className="flex items-center gap-2 border border-primary/20 rounded-full px-3 py-1.5 hover:shadow-lg hover:bg-white/40 transition-all">
                        <FaBars className="w-4 h-4 text-primary/70" />
                        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                            {user?.name?.charAt(0)}
                        </div>
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl shadow-2xl py-2 hidden group-hover:block animate-fade-up overflow-hidden">
                        <div className="px-4 py-3 border-b border-black/5 bg-primary/5">
                            <p className="font-bold text-sm text-primary">{user?.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <Link href="/bookings/my-trips" className="block px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors">My Trips</Link>
                        <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors">Profile Settings</Link>
                        <button onClick={() => logout()} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">Log out</button>
                    </div>
                 </div>
            ) : (
                 <div className="flex items-center gap-3">
                    <Link href="/login" className="text-sm font-bold text-primary hover:opacity-80 px-4">
                        Login
                    </Link>
                    <Link href="/register" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20 active:scale-95">
                        Join Now
                    </Link>
                 </div>
            )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-2xl" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FaBars />
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
             <div className="absolute top-20 left-0 w-full bg-white border-b shadow-lg p-4 flex flex-col gap-4 md:hidden">
                <Link href="/search" className="font-semibold text-lg">Stays</Link>
                <Link href="#" className="font-semibold text-lg text-gray-500">Experiences</Link>
                <Link href="/partner/register" className="font-semibold text-lg text-gray-500">Become a host</Link>
                <hr />
                {isAuthenticated ? (
                    <>
                        <p className="font-medium">Hi, {user?.name}</p>
                        <Link href="/bookings/my-trips" className="text-primary font-bold">My Trips</Link>
                        <Link href="/profile" className="text-primary font-bold">Profile Settings</Link>
                        <button onClick={() => logout()} className="text-left text-red-600 font-bold">Log out</button>
                    </>
                ) : (
                    <Link href="/login" className="bg-black text-white px-5 py-3 rounded-lg text-center font-medium">
                        Sign In
                    </Link>
                )}
             </div>
        )}
      </div>
    </nav>
  );
}
