'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaUserCircle, FaBars } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useProfile } from '@/hooks/useAuth';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useClearNotifications } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react';

export function CustomerNavbar() {
  const { isAuthenticated, user, logout, setAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { data: profile } = useProfile(mounted && !!token);
  const { data: notifications = [] } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { mutate: clearAll } = useClearNotifications();
  const unreadCount = notifications.filter((n: any) => !n.read_at).length;

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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
      <nav
        className="w-full transition-all duration-300 backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg rounded-2xl"
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
              <Link href="/search" className="text-sm font-bold text-primary/80 hover:text-primary transition-colors">{t({ id: 'Penginapan', en: 'Stays' })}</Link>
              <Link href="/wishlist" className="text-sm font-bold text-primary/60 hover:text-primary transition-colors">{t({ id: 'Wishlist', en: 'Wishlist' })}</Link>
              <Link href="#" className="text-sm font-bold text-primary/60 hover:text-primary transition-colors">{t({ id: 'Pengalaman', en: 'Experiences' })}</Link>
              <Link href="/partner/register" className="text-sm font-bold text-primary/60 hover:text-primary transition-colors">{t({ id: 'Jadi host', en: 'Become a host' })}</Link>
              
              {mounted && isAuthenticated && (
                <div className="relative">
                  <button
                    type="button"
                    className="relative h-10 w-10 rounded-full border border-primary/10 bg-white/20 flex items-center justify-center"
                    onClick={() => setIsNotifOpen((v) => !v)}
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 text-primary" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-primary/30 bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-primary/20">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/50">Notifications</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/50">
                            <button onClick={() => markAllRead()}>Mark all</button>
                            <span>•</span>
                            <button onClick={() => clearAll()}>Clear</button>
                          </div>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-4 text-xs text-primary/50">No notifications yet.</div>
                        ) : (
                          notifications.slice(0, 6).map((n: any) => (
                            <button
                              key={n.id}
                              className="w-full text-left px-4 py-3 border-b border-primary/10 text-sm text-primary/80 hover:bg-primary/10"
                              onClick={() => markRead(n.id)}
                            >
                              <div className="text-[10px] uppercase tracking-widest text-primary/40">{n.type}</div>
                              <div className="font-semibold">{n.data?.preview || 'New update'}</div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mounted && isAuthenticated ? (
                   <div
                      className="relative"
                      onMouseEnter={() => setIsProfileOpen(true)}
                      onMouseLeave={() => setIsProfileOpen(false)}
                   >
                      <button className="flex items-center gap-2 border border-primary/20 rounded-full px-3 py-1.5 hover:shadow-lg hover:bg-white/20 transition-all bg-white/10">
                          <FaBars className="w-4 h-4 text-primary/70" />
                          <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                              {user?.name?.charAt(0)}
                          </div>
                      </button>
                      <div className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl py-2 transition-opacity animate-fade-up overflow-hidden bg-black/80 backdrop-blur-xl border border-primary/20 ${isProfileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                          <div className="px-4 py-3 border-b border-primary/10 bg-white/5">
                              <p className="font-bold text-sm text-primary">{user?.name}</p>
                              <p className="text-[10px] text-primary/60 uppercase tracking-widest">{user?.role}</p>
                          </div>
                          <Link href="/wishlist" className="block px-4 py-2.5 text-sm font-medium text-primary/80 hover:bg-white/10 transition-colors">Wishlist</Link>
                          <Link href="/bookings/my-trips" className="block px-4 py-2.5 text-sm font-medium text-primary/80 hover:bg-white/10 transition-colors">My Trips</Link>
                          <Link href="/messages" className="block px-4 py-2.5 text-sm font-medium text-primary/80 hover:bg-white/10 transition-colors">Messages</Link>
                          <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium text-primary/80 hover:bg-white/10 transition-colors">Profile Settings</Link>
                          <button onClick={() => logout()} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">Log out</button>
                      </div>
                   </div>
              ) : (
                   <div className="flex items-center gap-3">
                      <Link href="/login" className="text-sm font-bold text-primary hover:opacity-80 px-4">
                          Login
                      </Link>
                      <Link href="/register" className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20 active:scale-95">
                          Join Now
                      </Link>
                   </div>
              )}
              <LanguageToggle className="ml-2" />
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden text-2xl w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <FaBars />
          </button>

        </div>
        
        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
             <div className="w-full bg-black/70 backdrop-blur-xl border-t border-white/20 p-5 flex flex-col gap-4 lg:hidden rounded-b-2xl">
                <Link href="/search" className="font-bold text-lg text-primary">Stays</Link>
                <Link href="/wishlist" className="font-bold text-lg text-primary/70">Wishlist</Link>
                <Link href="#" className="font-bold text-lg text-primary/70">Experiences</Link>
                <Link href="/partner/register" className="font-bold text-lg text-primary/70">Become a host</Link>
                <hr className="border-primary/20"/>
                <LanguageToggle />
                {isAuthenticated ? (
                    <>
                        <p className="font-bold text-primary">Hi, {user?.name}</p>
                        <Link href="/bookings/my-trips" className="text-green-400 font-bold">My Trips</Link>
                        <Link href="/messages" className="text-green-400 font-bold">Messages</Link>
                        <Link href="/profile" className="text-green-400 font-bold">Profile Settings</Link>
                        <button onClick={() => logout()} className="text-left text-red-500 font-bold">Log out</button>
                    </>
                ) : (
                    <Link href="/login" className="bg-primary text-white px-5 py-3 rounded-xl text-center font-bold uppercase tracking-widest text-xs">
                        Sign In
                    </Link>
                )}
             </div>
        )}
      </nav>
    </div>
  );
}
