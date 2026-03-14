'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useProfile } from '@/hooks/useAuth';

export function CustomerNavbar() {
  const { isAuthenticated, user, logout, setAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { data: profile } = useProfile(mounted && !!token);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  useEffect(() => {
    if (token && profile && !user) {
      setAuth(profile, token);
    }
  }, [token, profile, user, setAuth]);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 transition-all duration-300 backdrop-blur-xl bg-background/70 border-b border-white/20 shadow-sm"
    >
      <div className="w-full px-4 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src="/logo/logo_escape_plan.png" 
            alt="Escape Plan Logo" 
            width={110} 
            height={32} 
            className="object-contain"
          />
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
            <Link href="/search" className="text-sm font-black text-foreground/80 hover:text-primary transition-colors">{t({ id: 'Penginapan', en: 'Stays' })}</Link>
            <Link href="/wishlist" className="text-sm font-black text-foreground/60 hover:text-primary transition-colors">{t({ id: 'Wishlist', en: 'Wishlist' })}</Link>
            <Link href="#" className="text-sm font-black text-foreground/60 hover:text-primary transition-colors">{t({ id: 'Pengalaman', en: 'Experiences' })}</Link>
            <Link href="/partner/register" className="text-sm font-black text-foreground/60 hover:text-primary transition-colors">{t({ id: 'Jadi host', en: 'Become a host' })}</Link>
            
            {mounted && isAuthenticated ? (
                 <div
                    className="relative pb-2"
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                 >
                    <button className="flex items-center gap-2 border border-primary/20 rounded-full px-3 py-1.5 hover:shadow-lg hover:bg-white/40 transition-all bg-white/40">
                        <FaBars className="w-4 h-4 text-primary/70" />
                        <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                            {user?.name?.charAt(0)}
                        </div>
                    </button>
                    <div className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl py-2 transition-opacity animate-fade-up overflow-hidden bg-white/95 backdrop-blur-xl border border-black/10 ${isProfileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                        <div className="px-4 py-3 border-b border-black/5 bg-primary/5">
                            <p className="font-bold text-sm text-primary">{user?.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <Link href="/wishlist" className="block px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors">{t({ id: 'Wishlist', en: 'Wishlist' })}</Link>
                        <Link href="/bookings/my-trips" className="block px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors">{t({ id: 'Perjalanan Saya', en: 'My Trips' })}</Link>
                        <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium hover:bg-primary/10 transition-colors">{t({ id: 'Pengaturan Profil', en: 'Profile Settings' })}</Link>
                        <button onClick={() => logout()} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">{t({ id: 'Keluar', en: 'Log out' })}</button>
                    </div>
                 </div>
            ) : (
                 <div className="flex items-center gap-3">
                    <Link href="/login" className="text-sm font-black text-primary hover:opacity-80 px-4">
                        {t({ id: 'Masuk', en: 'Login' })}
                    </Link>
                    <Link href="/register" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20 active:scale-95">
                        {t({ id: 'Daftar Sekarang', en: 'Join Now' })}
                    </Link>
                 </div>
            )}
            <LanguageToggle className="ml-2" />
        </div>

        {/* Mobile Menu Button */}
        <button className="lg:hidden text-2xl w-10 h-10 rounded-full bg-white/60 border border-white/40 flex items-center justify-center" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FaBars />
        </button>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
             <div className="absolute top-20 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-white/30 shadow-lg p-5 flex flex-col gap-4 lg:hidden rounded-b-3xl">
                <Link href="/search" className="font-black text-lg">{t({ id: 'Penginapan', en: 'Stays' })}</Link>
                <Link href="/wishlist" className="font-black text-lg text-muted-foreground">{t({ id: 'Wishlist', en: 'Wishlist' })}</Link>
                <Link href="#" className="font-black text-lg text-muted-foreground">{t({ id: 'Pengalaman', en: 'Experiences' })}</Link>
                <Link href="/partner/register" className="font-black text-lg text-muted-foreground">{t({ id: 'Jadi host', en: 'Become a host' })}</Link>
                <hr />
                <LanguageToggle />
                {isAuthenticated ? (
                    <>
                        <p className="font-bold">{t({ id: 'Halo', en: 'Hi' })}, {user?.name}</p>
                        <Link href="/bookings/my-trips" className="text-primary font-black">{t({ id: 'Perjalanan Saya', en: 'My Trips' })}</Link>
                        <Link href="/profile" className="text-primary font-black">{t({ id: 'Pengaturan Profil', en: 'Profile Settings' })}</Link>
                        <button onClick={() => logout()} className="text-left text-red-600 font-black">{t({ id: 'Keluar', en: 'Log out' })}</button>
                    </>
                ) : (
                    <Link href="/login" className="bg-primary text-primary-foreground px-5 py-3 rounded-xl text-center font-black uppercase tracking-widest text-xs">
                        {t({ id: 'Masuk', en: 'Sign In' })}
                    </Link>
                )}
             </div>
        )}
      </div>
    </nav>
  );
}
