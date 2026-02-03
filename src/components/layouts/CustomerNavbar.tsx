'use client';

import Link from 'next/link';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import { useState } from 'react';

export function CustomerNavbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-black">
          Escape Plan.
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
            <Link href="/search" className="text-sm font-semibold text-black hover:text-gray-600 transition-colors">Stays</Link>
            <Link href="#" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">Experiences</Link>
            <Link href="/partner/register" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">Become a host</Link>
            
            {isAuthenticated ? (
                 <div className="relative group">
                    <button className="flex items-center gap-2 border rounded-full px-2 py-1 hover:shadow-md transition-shadow">
                        <FaBars className="w-4 h-4 text-gray-500" />
                        <FaUserCircle className="w-8 h-8 text-gray-500" />
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-xl py-2 hidden group-hover:block">
                        <div className="px-4 py-2 border-b">
                            <p className="font-semibold text-sm">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link href="/bookings/my-trips" className="block px-4 py-2 text-sm hover:bg-gray-50">My Trips</Link>
                        <button onClick={() => logout()} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Log out</button>
                    </div>
                 </div>
            ) : (
                 <div className="flex items-center gap-3">
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                        <FaUserCircle className="w-6 h-6" />
                    </button>
                    <Link href="/login" className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                        Sign In
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
                        <Link href="/bookings/my-trips" className="text-primary">My Trips</Link>
                        <button onClick={() => logout()} className="text-left text-red-600">Log out</button>
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
