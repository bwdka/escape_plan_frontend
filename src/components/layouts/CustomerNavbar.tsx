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
import { Bell, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { MiniSearch } from '@/components/features/search/MiniSearch';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';

type GuestPaymentTracker = {
  bookingId: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED' | string;
  trackingToken?: string | null;
  updatedAt?: string;
  vaBank?: string | null;
  vaNumber?: string | null;
  permataVaNumber?: string | null;
  billKey?: string | null;
  billerCode?: string | null;
  paymentCode?: string | null;
  store?: string | null;
};

export function CustomerNavbar() {
  const { isAuthenticated, user, logout, setAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isGuestNotifOpen, setIsGuestNotifOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [guestTracker, setGuestTracker] = useState<GuestPaymentTracker | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isHero = isHomePage && !isScrolled;
  const showMiniSearch = isScrolled || !isHomePage;
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
  const guestStatusLabel = guestTracker?.status === 'PAID'
    ? 'Payment Confirmed'
    : guestTracker?.status === 'CANCELLED'
      ? 'Payment Failed/Expired'
      : 'Waiting for Payment';
  const GuestStatusIcon = guestTracker?.status === 'PAID'
    ? CheckCircle2
    : guestTracker?.status === 'CANCELLED'
      ? XCircle
      : Clock3;
  const guestStatusColor = guestTracker?.status === 'PAID'
    ? 'text-emerald-400'
    : guestTracker?.status === 'CANCELLED'
      ? 'text-red-400'
      : 'text-amber-300';

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('token'));
      const rawTracker = localStorage.getItem('guest_payment_tracker');
      if (rawTracker) {
        try {
          const parsed = JSON.parse(rawTracker) as GuestPaymentTracker;
          if (parsed?.bookingId && parsed?.status) {
            setGuestTracker(parsed);
          }
        } catch {
          setGuestTracker(null);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'guest_payment_tracker') return;
      if (!event.newValue) {
        setGuestTracker(null);
        return;
      }
      try {
        const parsed = JSON.parse(event.newValue) as GuestPaymentTracker;
        setGuestTracker(parsed);
      } catch {
        setGuestTracker(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const interval = setInterval(() => {
      const rawTracker = localStorage.getItem('guest_payment_tracker');
      if (!rawTracker) {
        setGuestTracker(null);
        return;
      }
      try {
        const parsed = JSON.parse(rawTracker) as GuestPaymentTracker;
        setGuestTracker(parsed);
      } catch {
        setGuestTracker(null);
      }
    }, 3000);
    return () => clearInterval(interval);
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
          <div className={`transition-all duration-300 ${isSearchExpanded ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 w-auto'}`}>
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo/logo_escape_plan.png" 
                alt="Escape Plan Logo" 
                width={110} 
                height={32} 
                className={`object-contain transition-all duration-500 ${isHero ? 'brightness-0 invert' : ''}`}
              />
            </Link>
          </div>
          
          {/* Center Search (on scroll) */}
          <div className={`flex-1 hidden lg:flex justify-center transition-all duration-300 ${isSearchExpanded ? 'max-w-2xl' : 'max-w-xl'}`}>
            <AnimatePresence>
              {showMiniSearch && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                >
                  <Suspense fallback={<div className="h-10 w-32 bg-white/20 rounded-full animate-pulse" />}>
                    <MiniSearch onToggle={setIsSearchExpanded} />
                  </Suspense>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
          
          {/* Desktop Nav Right Side */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <Link href="/search" className={navLinkClass('/search')}>{t({ id: 'Penginapan', en: 'Stays' })}</Link>
              <Link href="/wishlist" className={navLinkClass('/wishlist')}>{t({ id: 'Wishlist', en: 'Wishlist' })}</Link>
              
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
                      <div className="relative">
                        <button
                          type="button"
                          className="relative h-10 w-10 rounded-full border border-primary/10 bg-white/20 flex items-center justify-center"
                          onClick={() => setIsGuestNotifOpen((v) => !v)}
                          aria-label="Guest payment notifications"
                        >
                          <Bell className={`w-4 h-4 ${isHero ? 'text-white' : 'text-primary'}`} />
                          {guestTracker && (
                            <span className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ${
                              guestTracker.status === 'PAID' ? 'bg-emerald-500' : guestTracker.status === 'CANCELLED' ? 'bg-red-500' : 'bg-amber-500'
                            }`} />
                          )}
                        </button>
                        {isGuestNotifOpen && (
                          <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden z-50">
                            <div className="px-5 py-3.5 border-b border-white/15">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Payment Updates</p>
                            </div>
                            <div className="px-5 py-4 space-y-2">
                              {guestTracker ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <GuestStatusIcon className={`w-4 h-4 ${guestStatusColor}`} />
                                    <p className="text-xs font-bold text-white">{guestStatusLabel}</p>
                                  </div>
                                  <p className="text-[10px] uppercase tracking-widest text-white/60">Booking ESC-{guestTracker.bookingId}</p>
                                  {guestTracker.vaBank && guestTracker.vaNumber && (
                                    <p className="text-xs text-white/85">
                                      <span className="font-bold uppercase mr-1">{guestTracker.vaBank}</span>
                                      <span className="font-mono">{guestTracker.vaNumber}</span>
                                    </p>
                                  )}
                                  {guestTracker.permataVaNumber && (
                                    <p className="text-xs text-white/85">
                                      <span className="font-bold uppercase mr-1">Permata</span>
                                      <span className="font-mono">{guestTracker.permataVaNumber}</span>
                                    </p>
                                  )}
                                  {guestTracker.billKey && guestTracker.billerCode && (
                                    <p className="text-xs text-white/85 font-mono">
                                      BK {guestTracker.billKey} • BC {guestTracker.billerCode}
                                    </p>
                                  )}
                                  {guestTracker.paymentCode && (
                                    <p className="text-xs text-white/85">
                                      <span className="font-bold uppercase mr-1">{guestTracker.store || 'CStore'}</span>
                                      <span className="font-mono">{guestTracker.paymentCode}</span>
                                    </p>
                                  )}
                                  {guestTracker.trackingToken && (
                                    <Link
                                      href={`/booking/status?booking_id=${guestTracker.bookingId}&token=${encodeURIComponent(guestTracker.trackingToken)}`}
                                      className="inline-block text-[10px] uppercase tracking-widest font-bold text-accent"
                                      onClick={() => setIsGuestNotifOpen(false)}
                                    >
                                      View payment details
                                    </Link>
                                  )}
                                  <button
                                    type="button"
                                    className="text-[10px] uppercase tracking-widest font-bold text-white/60"
                                    onClick={() => {
                                      localStorage.removeItem('guest_payment_tracker');
                                      setGuestTracker(null);
                                      setIsGuestNotifOpen(false);
                                    }}
                                  >
                                    Clear
                                  </button>
                                </>
                              ) : (
                                <p className="text-xs text-white/70">No payment updates yet.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                   <div className="flex items-center gap-1 xl:gap-2 whitespace-nowrap">
                      <Link href="/login" className={`text-sm font-bold hover:opacity-80 px-4 transition-colors ${isHero ? 'text-white' : 'text-primary'}`}>
                          Login
                      </Link>
                      <Link href="/register" className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20 active:scale-95">
                          Join Now
                      </Link>
                   </div>
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
