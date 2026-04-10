'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHero = pathname === '/' && !isScrolled;
  const dashboardLink = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'partner'
      ? '/partner/dashboard'
      : '/bookings/my-trips';
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
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (token && profile && !user) {
      setAuth(profile, token);
    }
  }, [token, profile, user, setAuth]);

  const navLinkClass = (href: string) => {
    const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
    if (isHero) {
      return `relative text-sm font-bold transition-all ${
        isActive ? 'text-white' : 'text-white/70 hover:text-white'
      } after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:bg-white/80 after:transition-all after:duration-300 ${
        isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
      } hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]`;
    }
    return `relative text-sm font-bold transition-all ${
      isActive ? 'text-primary' : 'text-primary/60 hover:text-primary'
    } after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:bg-primary/70 after:transition-all after:duration-300 ${
      isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
    } hover:drop-shadow-[0_0_10px_rgba(16,103,74,0.25)]`;
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50">
      <nav
        className={`w-full transition-all duration-500 backdrop-blur-xl rounded-2xl ${
          isHero
            ? 'bg-white/10 border border-white/20 shadow-lg'
            : 'bg-white/65 border border-white/60 shadow-2xl shadow-black/10'
        }`}
      >
        <div className={`w-full px-4 sm:px-6 lg:px-10 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'}`}>
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo/logo_escape_plan.png" 
              alt="Escape Plan Logo" 
              width={110} 
              height={32} 
              className={`object-contain transition-all duration-500 ${isHero ? 'brightness-0 invert' : ''}`}
            />
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
              <Link href="/search" className={navLinkClass('/search')}>{t({ id: 'Penginapan', en: 'Stays' })}</Link>
              <Link href="/wishlist" className={navLinkClass('/wishlist')}>{t({ id: 'Wishlist', en: 'Wishlist' })}</Link>
              <Link href="#" className={isHero ? 'text-sm font-bold text-white/70 hover:text-white transition-all' : 'text-sm font-bold text-primary/60 hover:text-primary transition-all'}>
                {t({ id: 'Pengalaman', en: 'Experiences' })}
              </Link>
              <Link href="/partner/register" className={navLinkClass('/partner/register')}>{t({ id: 'Jadi host', en: 'Become a host' })}</Link>
              
              {mounted && isAuthenticated && (
                <div className="relative">
                  <button
                    type="button"
                    className="relative h-10 w-10 rounded-full border border-primary/10 bg-white/20 flex items-center justify-center"
                    onClick={() => setIsNotifOpen((v) => !v)}
                    aria-label="Notifications"
                  >
                    <Bell className={`w-4 h-4 ${isHero ? 'text-white' : 'text-primary'}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotifOpen && (
                    <div className="absolute right-1 mt-3 w-72 rounded-2xl border border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
                      <div className="px-5 py-3.5 border-b border-white/15">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Notifications</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
                            <button onClick={() => markAllRead()}>Mark all</button>
                            <span>•</span>
                            <button onClick={() => clearAll()}>Clear</button>
                          </div>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-5 py-4 text-xs text-white/70">No notifications yet.</div>
                        ) : (
                          notifications.slice(0, 6).map((n: any) => (
                            <button
                              key={n.id}
                              className="w-full text-left px-5 py-3 border-b border-white/10 text-sm text-white/80 hover:bg-white/10"
                              onClick={() => markRead(n.id)}
                            >
                              <div className="text-[10px] uppercase tracking-widest text-white/50">{n.type}</div>
                              <div className="font-semibold text-white/90">{n.data?.preview || 'New update'}</div>
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
                          <p className="font-bold text-sm text-white">{user?.name}</p>
                              <p className="text-[10px] text-white/50 uppercase tracking-widest">{user?.role}</p>
                          </div>
                          <Link href={dashboardLink} className="block px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">Dashboard</Link>
                          <Link href="/wishlist" className="block px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">Wishlist</Link>
                          <Link href="/bookings/my-trips" className="block px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">My Trips</Link>
                          <Link href="/messages" className="block px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">Messages</Link>
                          <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors">Profile Settings</Link>
                          <button onClick={() => logout()} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">Log out</button>
                      </div>
                   </div>
              ) : (
                   <div className="flex items-center gap-3">
                      <Link href="/login" className={`text-sm font-bold hover:opacity-80 px-4 transition-colors ${isHero ? 'text-white' : 'text-primary'}`}>
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
          <button className={`lg:hidden text-2xl w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center transition-colors ${isHero ? 'text-white' : 'text-primary'}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <FaBars />
          </button>

        </div>
        
        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
             <div className="w-full bg-black/70 backdrop-blur-xl border-t border-white/20 p-5 flex flex-col gap-4 lg:hidden rounded-b-2xl">
                <Link href="/search" className="font-bold text-lg text-white">Stays</Link>
                <Link href="/wishlist" className="font-bold text-lg text-white/70">Wishlist</Link>
                <Link href="#" className="font-bold text-lg text-white/70">Experiences</Link>
                <Link href="/partner/register" className="font-bold text-lg text-white/70">Become a host</Link>
                <hr className="border-white/20"/>
                <LanguageToggle />
                {isAuthenticated ? (
                    <>
                        <p className="font-bold text-white">Hi, {user?.name}</p>
                        <Link href={dashboardLink} className="text-white/80 font-bold">Dashboard</Link>
                        <Link href="/bookings/my-trips" className="text-white/80 font-bold">My Trips</Link>
                        <Link href="/messages" className="text-white/80 font-bold">Messages</Link>
                        <Link href="/profile" className="text-white/80 font-bold">Profile Settings</Link>
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
