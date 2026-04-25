'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCalculatePriceQuery, useCreateBooking, usePaymentMethods } from '@/hooks/useBooking';
import { useProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Shield, Plus, Minus, AlertCircle, CheckCircle2, Circle, CalendarDays, UsersRound, X } from 'lucide-react';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { useI18n } from '@/i18n/I18nProvider';
import { useUnitBlockedDates, useUnitDetail } from '@/hooks/useGlampingDetail';
import { AMENITY_ICON_FALLBACK, AMENITY_ICON_MAP } from '@/lib/amenities';
import api from '@/lib/axios';

type BookingFormValues = {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_request?: string;
  check_in: string;
  check_out: string;
  total_guests: number;
};

type PaymentInstruction = {
  va_numbers?: Array<{ bank: string; va_number: string }>;
  permata_va_number?: string;
  bill_key?: string;
  biller_code?: string;
  actions?: Array<{ name?: string; url: string }>;
  redirect_url?: string;
  payment_code?: string;
  store?: string;
  qr_string?: string;
};

type AddonSelection = {
  id: number;
  quantity: number;
  name: string;
  price: number;
  icon: ComponentType<{ size?: number; className?: string }>;
};

type CreateBookingSuccessPayload = {
  booking_id?: number;
  guest_tracking_token?: string | null;
  status?: string;
  payment?: {
    response?: PaymentInstruction | null;
  } | null;
};

type ApiErrorPayload = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function BookingContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const unitId = Number(searchParams.get('unit_id'));
  const unitName = searchParams.get('unit_name');
  const checkInParam = searchParams.get('check_in') || '';
  const checkOutParam = searchParams.get('check_out') || '';

  const { data: userProfile } = useProfile();
  const { data: unitDetail } = useUnitDetail(unitId);
  const glampingName = unitDetail?.glamping?.name;
  const { data: blockedDates } = useUnitBlockedDates(unitId);
  const { data: paymentMethods = [] } = usePaymentMethods();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentInstruction, setPaymentInstruction] = useState<PaymentInstruction | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [guestTrackingToken, setGuestTrackingToken] = useState<string | null>(null);
  const [trackedBookingStatus, setTrackedBookingStatus] = useState<string | null>(null);
  const [showPaymentInstructionModal, setShowPaymentInstructionModal] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [logoLoadFailed, setLogoLoadFailed] = useState<Record<string, boolean>>({});
  const paymentInstructionRef = useRef<HTMLDivElement | null>(null);
  const [cardToken, setCardToken] = useState<string>('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [selectedAddons, setSelectedAddons] = useState<AddonSelection[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  const bookingSchema = z.object({
    guest_name: z.string().min(3, t({ id: 'Nama lengkap harus diisi', en: 'Full name is required' })),
    guest_email: z.string().email(t({ id: 'Email tidak valid', en: 'Invalid email' })),
    guest_phone: z.string().min(10, t({ id: 'Nomor WhatsApp tidak valid', en: 'Invalid WhatsApp number' })),
    special_request: z.string().optional(),
    check_in: z.string().min(1, t({ id: 'Tanggal check-in harus diisi', en: 'Check-in date is required' })),
    check_out: z.string().min(1, t({ id: 'Tanggal check-out harus diisi', en: 'Check-out date is required' })),
    total_guests: z.number().min(1, t({ id: 'Minimal 1 tamu', en: 'Minimum 1 guest' })),
  }).refine(data => new Date(data.check_out) > new Date(data.check_in), {
      message: t({ id: 'Check-out harus setelah check-in', en: 'Check-out must be after check-in' }),
      path: ["check_out"]
  });

  const updateAddonQuantity = (id: number, delta: number) => {
      setSelectedAddons(prev => prev.map(addon => {
          if (addon.id === id) {
              const newQty = Math.max(0, addon.quantity + delta);
              return { ...addon, quantity: newQty };
          }
          return addon;
      }));
  };

  const activeAddons = selectedAddons.filter(a => a.quantity > 0).map(a => ({ id: a.id, quantity: a.quantity }));

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      guest_name: userProfile?.name || '',
      guest_email: userProfile?.email || '',
      guest_phone: userProfile?.phone || '',
      special_request: '',
      check_in: checkInParam,
      check_out: checkOutParam,
      total_guests: 2,
    }
  });

  const checkInValue = form.watch('check_in');
  const checkOutValue = form.watch('check_out');
  const watchedGuests = form.watch('total_guests');
  const startDate = checkInValue ? new Date(checkInValue) : null;
  const endDate = checkOutValue ? new Date(checkOutValue) : null;
  const stayNights = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
  }, [startDate, endDate]);
  const stayDateLabel = useMemo(() => {
    if (!startDate || !endDate) return t({ id: 'Pilih tanggal menginap', en: 'Select stay dates' });
    return `${startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [endDate, startDate, t]);
  const activeAddonCount = selectedAddons.filter((addon) => addon.quantity > 0).length;
  const activeAddonTotal = selectedAddons.reduce((total, addon) => total + addon.quantity * addon.price, 0);

  const handleDateChange = (dates: [Date | null, Date | null]) => {
      const [start, end] = dates;
      form.setValue('check_in', start ? start.toISOString().split('T')[0] : '', { shouldValidate: true });
      form.setValue('check_out', end ? end.toISOString().split('T')[0] : '', { shouldValidate: true });
  };

  const { data: priceData, isLoading: isCalculating, error: calculationError } = useCalculatePriceQuery({
    unit_id: unitId,
    check_in: form.watch('check_in'),
    check_out: form.watch('check_out'),
    quantity: 1,
    total_guests: form.watch('total_guests'),
    addons: activeAddons,
    payment_method_id: selectedPaymentMethod || undefined,
    promo_code: appliedPromo || undefined,
    enabled: !!unitId && !!form.watch('check_in') && !!form.watch('check_out')
  });

  useEffect(() => {
    if (!appliedPromo) return;
    if (isCalculating) return;
    if (!priceData) return;

    if ((priceData.discount_amount || 0) <= 0) {
      toast.error(t({ id: 'Kode promo tidak valid / tidak memenuhi syarat.', en: 'Promo code is invalid / not eligible.' }));
    }
  }, [appliedPromo, isCalculating, priceData, t]);

  const { mutate: createBooking, isPending: isBooking } = useCreateBooking();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasAuthToken(!!localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (userProfile) {
        form.setValue('guest_name', userProfile.name);
        form.setValue('guest_email', userProfile.email);
        form.setValue('guest_phone', userProfile.phone || '');
    }
    if (checkInParam) form.setValue('check_in', checkInParam);
    if (checkOutParam) form.setValue('check_out', checkOutParam);
  }, [userProfile, checkInParam, checkOutParam, form]);

  useEffect(() => {
    if (!selectedPaymentMethod && paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPaymentMethod]);

  const resolveAddonIcon = (addon: { icon?: string | null; name?: string | null }) => {
    const raw = (addon?.icon || addon?.name || '').toString().toLowerCase();
    if (!raw) return AMENITY_ICON_FALLBACK;
    const normalized = raw
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_');
    return AMENITY_ICON_MAP[raw] || AMENITY_ICON_MAP[normalized] || AMENITY_ICON_FALLBACK;
  };

  useEffect(() => {
    const addons = unitDetail?.glamping?.addons || [];
    if (!Array.isArray(addons)) {
      setSelectedAddons([]);
      return;
    }
    setSelectedAddons(addons.map((addon: { id: number; name: string; price: number; icon?: string | null }) => ({
      id: addon.id,
      quantity: 0,
      name: addon.name,
      price: Number(addon.price),
      icon: resolveAddonIcon(addon),
    })));
  }, [unitDetail?.glamping?.addons]);

  const onSubmit = (data: BookingFormValues) => {
    if (!unitId) return;
    if (!selectedPaymentMethod) {
      toast.error(t({ id: 'Pilih metode pembayaran terlebih dahulu', en: 'Please select a payment method' }));
      return;
    }
    createBooking({
        unit_id: unitId,
        ...data,
        addons: activeAddons,
        quantity: 1,
        payment_method_id: selectedPaymentMethod,
        promo_code: appliedPromo || undefined,
        card_token: selectedPaymentMethod === 'credit_card' ? cardToken : undefined,
    }, { 
        onSuccess: (res: CreateBookingSuccessPayload) => {
            const bookingId = Number(res.booking_id || 0);
            const safeBookingId = Number.isFinite(bookingId) && bookingId > 0 ? bookingId : null;
            setCreatedBookingId(safeBookingId);
            setGuestTrackingToken(res.guest_tracking_token || null);
            setTrackedBookingStatus(res.status || 'PENDING_PAYMENT');
            const instruction = res.payment?.response || null;
            if (typeof window !== 'undefined' && safeBookingId) {
              localStorage.setItem('guest_payment_tracker', JSON.stringify(
                buildGuestTracker(safeBookingId, res.status || 'PENDING_PAYMENT', instruction, res.guest_tracking_token || null)
              ));
            }
            setPaymentInstruction(instruction);
            if (instruction) {
              setShowPaymentInstructionModal(true);
              setTimeout(() => {
                paymentInstructionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 250);
            }
            toast.success(t({ id: 'Booking dibuat. Silakan selesaikan pembayaran.', en: 'Booking created. Please complete payment.' }));
        },
        onError: (err: unknown) => {
          const maybeErr = err as ApiErrorPayload;
          toast.error(maybeErr.response?.data?.message || t({ id: 'Booking gagal dibuat', en: 'Booking creation failed' }));
        }
    });
  };

  useEffect(() => {
    if (!createdBookingId || !guestTrackingToken) return;

    let active = true;
    const poll = async () => {
      try {
        const { data } = await api.post('/bookings/guest-status', {
          booking_id: createdBookingId,
          tracking_token: guestTrackingToken,
        });
        if (!active) return;

        const nextStatus = data?.data?.status;
        if (!nextStatus) return;

        if (typeof window !== 'undefined') {
          localStorage.setItem('guest_payment_tracker', JSON.stringify(
            buildGuestTracker(createdBookingId, nextStatus, data?.data?.payment_payload || paymentInstruction, guestTrackingToken)
          ));
        }
        if (nextStatus === trackedBookingStatus) return;

        setTrackedBookingStatus(nextStatus);

        if (nextStatus === 'PAID') {
          toast.success(t({ id: 'Pembayaran berhasil dikonfirmasi', en: 'Payment has been confirmed' }));
        } else if (nextStatus === 'CANCELLED') {
          toast.error(t({ id: 'Pembayaran gagal atau kedaluwarsa', en: 'Payment failed or expired' }));
        }
      } catch {
        // ignore transient polling error
      }
    };

    poll();
    const interval = setInterval(poll, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [createdBookingId, guestTrackingToken, paymentInstruction, trackedBookingStatus, t]);

  const scrollToPaymentInstruction = () => {
    paymentInstructionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const buildGuestTracker = (bookingId: number, status: string, payload?: PaymentInstruction | null, token?: string | null) => ({
    bookingId,
    status,
    trackingToken: token || null,
    updatedAt: new Date().toISOString(),
    vaBank: payload?.va_numbers?.[0]?.bank || null,
    vaNumber: payload?.va_numbers?.[0]?.va_number || null,
    permataVaNumber: payload?.permata_va_number || null,
    billKey: payload?.bill_key || null,
    billerCode: payload?.biller_code || null,
    paymentCode: payload?.payment_code || null,
    store: payload?.store || null,
  });

  const goToStatusPage = () => {
    if (!createdBookingId) return;
    if (hasAuthToken) {
      router.push(`/bookings/${createdBookingId}`);
      return;
    }
    if (guestTrackingToken) {
      router.push(`/booking/status?booking_id=${createdBookingId}&token=${encodeURIComponent(guestTrackingToken)}`);
      return;
    }
    scrollToPaymentInstruction();
  };

  if (!unitId) return <div className="p-8 text-center">{t({ id: 'Sesi Booking Tidak Valid', en: 'Invalid booking session' })}</div>;
  const policyType = unitDetail?.glamping?.cancellation_policy || 'moderate';
  const policyLabel = policyType === 'flexible' ? t({ id: 'Fleksibel', en: 'Flexible' }) : policyType === 'strict' ? t({ id: 'Ketat', en: 'Strict' }) : t({ id: 'Moderat', en: 'Moderate' });
  const selectedPaymentMethodData = paymentMethods.find((method) => method.id === selectedPaymentMethod);
  const getPaymentBrandMeta = (method: { payment_type: string; bank?: string; label: string }) => {
    const source = `${method.payment_type} ${method.bank || ''} ${method.label}`.toLowerCase();
    if (source.includes('qris')) return { short: 'QRIS', badge: 'from-red-600 to-red-500', ring: 'ring-red-500/25', text: 'text-red-700', soft: 'bg-red-50' };
    if (source.includes('gopay') || source.includes('go_pay')) return { short: 'GoPay', badge: 'from-sky-600 to-cyan-500', ring: 'ring-sky-500/25', text: 'text-sky-700', soft: 'bg-sky-50' };
    if (source.includes('bca')) return { short: 'BCA', badge: 'from-blue-700 to-blue-500', ring: 'ring-blue-500/25', text: 'text-blue-700', soft: 'bg-blue-50' };
    if (source.includes('bni')) return { short: 'BNI', badge: 'from-orange-600 to-orange-500', ring: 'ring-orange-500/25', text: 'text-orange-700', soft: 'bg-orange-50' };
    if (source.includes('bri')) return { short: 'BRI', badge: 'from-indigo-700 to-blue-600', ring: 'ring-indigo-500/25', text: 'text-indigo-700', soft: 'bg-indigo-50' };
    if (source.includes('mandiri')) return { short: 'Mandiri', badge: 'from-yellow-500 to-amber-500', ring: 'ring-amber-500/25', text: 'text-amber-700', soft: 'bg-amber-50' };
    if (source.includes('permata')) return { short: 'Permata', badge: 'from-emerald-600 to-emerald-500', ring: 'ring-emerald-500/25', text: 'text-emerald-700', soft: 'bg-emerald-50' };
    if (source.includes('cimb')) return { short: 'CIMB', badge: 'from-rose-600 to-red-500', ring: 'ring-rose-500/25', text: 'text-rose-700', soft: 'bg-rose-50' };
    if (source.includes('credit_card') || source.includes('credit card') || source.includes('card')) return { short: 'Card', badge: 'from-zinc-700 to-zinc-600', ring: 'ring-zinc-500/25', text: 'text-zinc-700', soft: 'bg-zinc-50' };
    return { short: (method.bank || method.payment_type || 'Pay').slice(0, 6).toUpperCase(), badge: 'from-primary to-primary/80', ring: 'ring-primary/20', text: 'text-primary', soft: 'bg-primary/5' };
  };
  const getPaymentDisplayName = (method: { payment_type: string; bank?: string; label: string }) => {
    const source = `${method.payment_type} ${method.bank || ''} ${method.label}`.toLowerCase();
    if (source.includes('qris')) return 'QRIS';
    if (source.includes('gopay') || source.includes('go_pay')) return 'GoPay';
    if (source.includes('bca')) return 'BCA';
    if (source.includes('bni')) return 'BNI';
    if (source.includes('bri')) return 'BRI';
    if (source.includes('mandiri')) return 'Mandiri';
    if (source.includes('permata')) return 'Permata';
    if (source.includes('cimb')) return 'CIMB';
    if (source.includes('credit_card') || source.includes('credit card') || source.includes('card')) return 'Card';
    return method.label
      .replace(/virtual account/gi, '')
      .replace(/bill payment/gi, '')
      .replace(/bank[_\s-]*transfer/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  const getPaymentLogoSrc = (method: { payment_type: string; bank?: string; label: string; [key: string]: unknown }) => {
    const dynamicLogo = [
      method.logo_url,
      method.logo,
      method.icon,
      method.image,
      method.brand_logo,
      method.payment_logo,
    ].find((item) => typeof item === 'string' && item.trim().length > 0) as string | undefined;
    if (dynamicLogo) return dynamicLogo;

    const source = `${method.payment_type} ${method.bank || ''} ${method.label}`.toLowerCase();
    if (source.includes('qris')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/QRIS_logo.svg';
    if (source.includes('gopay') || source.includes('go_pay')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/Gopay_logo.svg';
    if (source.includes('bca')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/Bank_Central_Asia.svg';
    if (source.includes('bni')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/Bank_Negara_Indonesia_logo_(2004).svg';
    if (source.includes('bri')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/BANK_BRI_logo.svg';
    if (source.includes('mandiri')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/Bank_Mandiri_logo_2016.svg';
    if (source.includes('permata')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/PermataBank_(2024)_prototype_logo.svg';
    if (source.includes('cimb')) return 'https://commons.wikimedia.org/wiki/Special:FilePath/CIMB_Niaga_logo.svg';
    if (source.includes('credit_card') || source.includes('credit card') || source.includes('card')) return '/payment-logos/card.svg';
    return null;
  };
  const selectedPaymentBrand = selectedPaymentMethodData ? getPaymentBrandMeta(selectedPaymentMethodData) : null;
  const selectedPaymentLogo = selectedPaymentMethodData ? getPaymentLogoSrc(selectedPaymentMethodData) : null;

  return (
    <>
    <div className="container mx-auto px-4 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 max-w-6xl">
      <div className="lg:col-span-2 space-y-10">
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-primary tracking-tighter">{t({ id: 'Konfirmasi Pesanan', en: 'Confirm Your Booking' })}</h1>
                <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">{t({ id: 'Lengkapi data Anda untuk mengamankan tenda ini', en: 'Complete your details to secure this stay' })}</p>
            </div>
        </div>

        <div className="rounded-[2rem] border border-primary/10 bg-white/75 p-5 md:p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-4">
            {t({ id: 'Progress Booking', en: 'Booking Progress' })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                key: 'dates',
                done: !!checkInValue && !!checkOutValue && stayNights > 0,
                title: t({ id: 'Tanggal valid', en: 'Valid dates' }),
                desc: stayDateLabel,
              },
              {
                key: 'guest',
                done: watchedGuests > 0,
                title: t({ id: 'Jumlah tamu', en: 'Guest count' }),
                desc: `${watchedGuests || 0} ${t({ id: 'tamu', en: 'guests' })}`,
              },
              {
                key: 'payment',
                done: !!selectedPaymentMethod,
                title: t({ id: 'Pembayaran dipilih', en: 'Payment selected' }),
                desc: selectedPaymentMethodData ? getPaymentDisplayName(selectedPaymentMethodData) : t({ id: 'Belum dipilih', en: 'Not selected yet' }),
              },
            ].map((item) => (
              <div key={item.key} className="rounded-2xl border border-primary/10 bg-white p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  {item.done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4 text-primary/40" />}
                  <p className="text-[10px] font-black uppercase tracking-widest">{item.title}</p>
                </div>
                <p className="text-xs font-bold text-primary/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-white/40 space-y-8 md:space-y-10 shadow-xl">
            <div className="space-y-6">
                <h3 className="font-black text-xl text-primary tracking-tight">{t({ id: 'Data Tamu', en: 'Guest Details' })}</h3>
                <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Periode Menginap', en: 'Stay Dates' })}</Label>
                             <div className="relative">
                                 <CustomDatePicker 
                                    startDate={startDate}
                                    endDate={endDate}
                                    onChange={handleDateChange}
                                    bookedDates={blockedDates || []}
                                    className="w-full"
                                    triggerClassName="h-12 rounded-xl bg-white/50 border-2 border-primary/5 px-4 py-2 hover:bg-white/80 transition-all shadow-inner text-sm font-medium text-primary"
                                    showLabel={false}
                                 />
                             </div>
                             {(form.formState.errors.check_in || form.formState.errors.check_out) && (
                                 <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">
                                     {form.formState.errors.check_in?.message || form.formState.errors.check_out?.message}
                                 </p>
                             )}
                         </div>
                         <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Jumlah Tamu', en: 'Guests' })}</Label>
                            <Input type="number" {...form.register('total_guests', { valueAsNumber: true })} className={`h-11 rounded-xl ${form.formState.errors.total_guests ? 'border-red-300 focus-visible:ring-red-200' : ''}`} />
                             {(priceData?.extra_guests ?? 0) > 0 && priceData && (
                                 <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 mt-2">
                                     <AlertCircle size={14} className="text-amber-600 mt-0.5" />
                                     <p className="text-[10px] font-bold text-amber-700 leading-normal uppercase">
                                         {t({
                                           id: `Kapasitas unit adalah ${priceData.capacity} orang. Anda akan dikenakan biaya tambahan untuk ${priceData.extra_guests} orang ekstra.`,
                                           en: `Unit capacity is ${priceData.capacity} guests. Extra fee applies for ${priceData.extra_guests} extra guests.`
                                         })}
                                     </p>
                                 </div>
                             )}
                         </div>
                    </div>

                    <div className="pt-6 border-t border-primary/5">
                        <div className="flex items-start gap-3 bg-primary/5 border border-primary/10 rounded-2xl p-4">
                            <Shield className="w-5 h-5 text-primary mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-primary/70">{t({ id: 'Kebijakan Pembatalan', en: 'Cancellation Policy' })}</p>
                                <p className="text-sm font-bold text-primary">{policyLabel}</p>
                                <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest">
                                    {unitDetail?.glamping?.reschedule_allowed ? t({ id: 'Reschedule Diizinkan', en: 'Reschedule Allowed' }) : t({ id: 'Reschedule Tidak Diizinkan', en: 'No Reschedule' })}
                                </p>
                                {unitDetail?.glamping?.min_nights ? (
                                  <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest">
                                      {t({ id: `Minimal ${unitDetail.glamping.min_nights} malam`, en: `Minimum ${unitDetail.glamping.min_nights} nights` })}
                                  </p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-primary/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Nama Lengkap', en: 'Full Name' })}</Label>
                            <Input placeholder={t({ id: 'Sesuai KTP', en: 'As per ID' })} {...form.register('guest_name')} className={`rounded-xl ${form.formState.errors.guest_name ? 'border-red-300 focus-visible:ring-red-200' : ''}`} />
                             {form.formState.errors.guest_name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.guest_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'No. WhatsApp', en: 'WhatsApp Number' })}</Label>
                            <Input placeholder="081..." {...form.register('guest_phone')} className={`rounded-xl ${form.formState.errors.guest_phone ? 'border-red-300 focus-visible:ring-red-200' : ''}`} />
                             {form.formState.errors.guest_phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.guest_phone.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Alamat Email', en: 'Email Address' })}</Label>
                            <Input type="email" placeholder="email@example.com" {...form.register('guest_email')} className={`rounded-xl h-12 ${form.formState.errors.guest_email ? 'border-red-300 focus-visible:ring-red-200' : ''}`} />
                             {form.formState.errors.guest_email && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.guest_email.message}</p>}
                             <p className="text-[9px] font-bold text-accent uppercase tracking-widest mt-2 ml-1 flex items-center gap-1.5">
                                <AlertCircle size={10} /> {t({ id: 'Pastikan email aktif & benar untuk verifikasi akun & kirim e-tiket.', en: 'Use an active email for verification and e-ticket delivery.' })}
                             </p>
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Permintaan Khusus (Opsional)', en: 'Special Requests (Optional)' })}</Label>
                            <Textarea placeholder={t({ id: 'Contoh: Dietary needs, jam kedatangan, dsb.', en: 'Example: Dietary needs, arrival time, etc.' })} {...form.register('special_request')} className="rounded-2xl bg-white/50 border-primary/5 min-h-[100px]" />
                        </div>
                    </div>
                 </form>
            </div>
        </div>

        <div className="glass p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-white/40 shadow-xl space-y-6">
            <h3 className="font-black text-xl text-primary tracking-tight">{t({ id: 'Tambah Fasilitas (Add-ons)', en: 'Add Extra Facilities' })}</h3>
            <div className="grid grid-cols-1 gap-4">
                {selectedAddons.map((addon) => (
                    <div key={addon.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 md:p-6 rounded-[2rem] bg-white/50 border border-black/5 hover:border-accent/30 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                                <addon.icon />
                            </div>
                            <div>
                                <p className="font-black text-primary">{addon.name}</p>
                                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Rp {addon.price.toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-4 bg-white rounded-full border border-primary/5 p-1 px-4 w-full sm:w-auto">
                            <button type="button" onClick={() => updateAddonQuantity(addon.id, -1)} className="w-8 h-8 rounded-full flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/5 transition-all"><Minus size={14} /></button>
                            <span className="w-4 text-center font-black text-primary text-sm">{addon.quantity}</span>
                            <button type="button" onClick={() => updateAddonQuantity(addon.id, 1)} className="w-8 h-8 rounded-full flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/5 transition-all"><Plus size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {paymentInstruction && (
          <div ref={paymentInstructionRef} className="glass p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-white/40 shadow-xl space-y-4 ring-2 ring-accent/20">
            <h3 className="font-black text-xl text-primary tracking-tight">{t({ id: 'Instruksi Pembayaran', en: 'Payment Instructions' })}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">
              {t({ id: 'Penting: selesaikan pembayaran sebelum batas waktu berakhir', en: 'Important: complete payment before the deadline' })}
            </p>
            {paymentInstruction.va_numbers && (
              <div className="text-sm text-primary">
                {paymentInstruction.va_numbers.map((va, idx: number) => (
                  <div key={idx} className="flex items-center justify-between border-b border-primary/5 py-2">
                    <span className="font-bold uppercase">{va.bank}</span>
                    <span className="font-mono">{va.va_number}</span>
                  </div>
                ))}
              </div>
            )}
            {paymentInstruction.permata_va_number && (
              <div className="text-sm text-primary">
                <div className="flex items-center justify-between border-b border-primary/5 py-2">
                  <span className="font-bold uppercase">Permata</span>
                  <span className="font-mono">{paymentInstruction.permata_va_number}</span>
                </div>
              </div>
            )}
            {paymentInstruction.bill_key && paymentInstruction.biller_code && (
              <div className="text-sm text-primary">
                <div className="flex items-center justify-between border-b border-primary/5 py-2">
                  <span className="font-bold uppercase">Mandiri Bill Key</span>
                  <span className="font-mono">{paymentInstruction.bill_key}</span>
                </div>
                <div className="flex items-center justify-between border-b border-primary/5 py-2">
                  <span className="font-bold uppercase">Biller Code</span>
                  <span className="font-mono">{paymentInstruction.biller_code}</span>
                </div>
              </div>
            )}
            {paymentInstruction.actions && (
              <div className="space-y-2">
                {paymentInstruction.actions.map((action, idx: number) => (
                  <a key={idx} href={action.url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent underline">
                    {action.name || 'Open Payment Link'}
                  </a>
                ))}
              </div>
            )}
            {paymentInstruction.redirect_url && (
              <a href={paymentInstruction.redirect_url} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-accent underline">
                Open 3DS / Card Authentication
              </a>
            )}
            {paymentInstruction.payment_code && (
              <div className="text-sm text-primary mt-2">
                <div className="flex items-center justify-between border-b border-primary/5 py-2">
                  <span className="font-bold uppercase">{paymentInstruction.store || 'CStore'}</span>
                  <span className="font-mono">{paymentInstruction.payment_code}</span>
                </div>
              </div>
            )}
            {paymentInstruction.qr_string && (
              <p className="text-sm text-primary/70">QR String: {paymentInstruction.qr_string}</p>
            )}
          </div>
        )}
      </div>

      <div className="self-start h-fit">
          <div className="lg:sticky lg:top-28 space-y-6">
              <div className="glass p-6 md:p-8 rounded-[2rem] border-white/40 shadow-xl space-y-4">
                  <h3 className="font-black text-sm text-primary uppercase tracking-widest">{t({ id: 'Punya Kode Promo?', en: 'Have a Promo Code?' })}</h3>
                  <div className="flex gap-2">
                      <Input 
                          placeholder="KODEPROMO" 
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="rounded-xl border-primary/10 bg-white/70 h-11 uppercase font-black tracking-widest"
                      />
                      <Button 
                          type="button"
                          onClick={() => {
                              if (!promoCode) return;
                              setAppliedPromo(promoCode);
                              toast.info(t({ id: 'Menerapkan promo...', en: 'Applying promo...' }));
                          }}
                          className="h-11 rounded-xl bg-accent text-white font-black uppercase tracking-widest px-4"
                      >
                          {t({ id: 'Pakai', en: 'Apply' })}
                      </Button>
                  </div>
                  {appliedPromo && priceData?.discount_amount && (
                      <div className="flex items-center gap-2 p-2 px-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                              {appliedPromo} {t({ id: 'Berhasil Digunakan', en: 'Applied Successfully' })}
                          </p>
                          <button onClick={() => { setAppliedPromo(''); setPromoCode(''); }} className="ml-auto text-emerald-700/50 hover:text-emerald-700"><X className="w-3 h-3" /></button>
                      </div>
                  )}
              </div>

              <div className="glass p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-white/40 shadow-2xl space-y-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <h3 className="font-black text-xl text-primary tracking-tight relative">{t({ id: 'Ringkasan Pesanan', en: 'Booking Summary' })}</h3>
              <div className="relative space-y-6">
                  <div className="rounded-2xl border border-primary/10 bg-white/70 p-4 space-y-2">
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Villa', en: 'Villa' })}</div>
                      <div className="font-black text-primary">{glampingName || t({ id: 'Escape Plan', en: 'Escape Plan' })}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Unit', en: 'Unit' })}: <span className="text-primary/70">{unitName}</span></div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Tanggal', en: 'Dates' })}: <span className="text-primary/70">{stayDateLabel}</span></div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Durasi', en: 'Duration' })}: <span className="text-primary/70">{stayNights > 0 ? `${stayNights} ${t({ id: 'malam', en: 'nights' })}` : '-'}</span></div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Tamu', en: 'Guests' })}: <span className="text-primary/70">{watchedGuests || 1}</span></div>
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-primary">
                          <CalendarDays className="w-3 h-3" />
                          {stayNights > 0 ? `${stayNights} ${t({ id: 'malam', en: 'nights' })}` : t({ id: 'Tanggal belum lengkap', en: 'Dates incomplete' })}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-accent">
                          <UsersRound className="w-3 h-3" />
                          {watchedGuests || 1} {t({ id: 'tamu', en: 'guests' })}
                        </span>
                      </div>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Tenda', en: 'Unit' })}</span>
                      <span className="font-black text-primary text-right text-sm">{unitName}</span>
                  </div>
                  <div className="h-px bg-primary/5" />
                  {isCalculating ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
                  ) : calculationError ? (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-100"><p className="text-[10px] font-bold text-red-500 uppercase leading-relaxed">{((calculationError as ApiErrorPayload | null)?.response?.data?.message) || t({ id: 'Kesalahan kalkulasi harga', en: 'Price calculation error' })}</p></div>
                  ) : priceData ? (
                      <div className="space-y-4">
                          {priceData.breakdown.filter(item => item.item_type !== 'App\\Models\\Coupon').map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center"><span className="text-xs font-bold text-primary/60">{item.label}</span><span className="text-sm font-black text-primary">Rp {item.value.toLocaleString('id-ID')}</span></div>
                          ))}
                          {activeAddonCount > 0 && (
                            <div className="rounded-xl border border-primary/10 bg-primary/5 px-3 py-2 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                {t({ id: 'Add-on dipilih', en: 'Selected add-ons' })} ({activeAddonCount})
                              </span>
                              <span className="text-xs font-black text-primary">Rp {activeAddonTotal.toLocaleString('id-ID')}</span>
                            </div>
                          )}
                          <div className="pt-4 mt-4 border-t border-primary/5 flex justify-between items-center"><span className="text-xs font-black uppercase text-primary/40">{t({ id: 'Subtotal', en: 'Subtotal' })}</span><span className="text-lg font-black text-primary">Rp {priceData.attractive_price.toLocaleString('id-ID')}</span></div>
                          <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-bold text-primary/40 uppercase tracking-widest"><span>{t({ id: 'Pajak (PPN 11%)', en: 'Tax (VAT 11%)' })}</span><span>Rp {priceData.tax_amount.toLocaleString('id-ID')}</span></div>
                              <div className="flex justify-between items-center text-[10px] font-bold text-primary/40 uppercase tracking-widest"><span>{t({ id: 'Biaya Aplikasi', en: 'Service Fee' })}</span><span>Rp {priceData.service_fee.toLocaleString('id-ID')}</span></div>
                              {priceData.discount_amount > 0 && (
                                <div className="flex justify-between items-center text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                    <span>{t({ id: 'Promo', en: 'Promo' })} ({appliedPromo})</span>
                                    <span>- Rp {priceData.discount_amount.toLocaleString('id-ID')}</span>
                                </div>
                              )}
                          </div>
                          <div className="pt-6 mt-6 border-t-2 border-dashed border-primary/10 flex justify-between items-end">
                              <div className="flex flex-col"><span className="font-black uppercase tracking-widest text-xs text-primary">{t({ id: 'Total Akhir', en: 'Grand Total' })}</span><span className="text-[8px] font-bold text-primary/30 uppercase tracking-tighter">{t({ id: 'Sudah termasuk pajak & biaya', en: 'Includes taxes & fees' })}</span></div>
                              <div className="text-3xl font-black text-primary tracking-tighter"><span className="text-sm font-bold mr-1 italic text-primary/30">Rp</span>{priceData.total_price.toLocaleString('id-ID')}</div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center text-primary/20 py-10"><p className="text-xs font-black uppercase tracking-[0.2em]">{t({ id: 'Pilih tanggal menginap', en: 'Select your stay dates' })}</p></div>
                  )}
              </div>
              <div className="space-y-4">
                  {paymentInstruction && (
                    <div className="p-4 rounded-2xl border border-accent/30 bg-accent/5 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent">
                        {t({ id: 'Instruksi pembayaran sudah tersedia', en: 'Payment instructions are ready' })}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={scrollToPaymentInstruction}
                        className="w-full h-10 rounded-xl border-accent/40 text-accent font-black uppercase tracking-[0.12em]"
                      >
                        {t({ id: 'Lihat Instruksi Pembayaran', en: 'View Payment Instructions' })}
                      </Button>
                      {createdBookingId && (
                        <Button
                          type="button"
                          onClick={goToStatusPage}
                          className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-[0.12em]"
                        >
                          {t({ id: 'Buka Status Booking', en: 'Open Booking Status' })}
                        </Button>
                      )}
                      {trackedBookingStatus && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/50 text-center">
                          {t({ id: 'Status saat ini', en: 'Current Status' })}: {trackedBookingStatus}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                      <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">{t({ id: 'Inventory Hold', en: 'Inventory Hold' })}</p>
                      <p className="text-[11px] font-bold text-primary/60 leading-relaxed">
                        {t({ id: 'Tenda akan dikunci selama', en: 'This unit will be held for' })}{' '}
                        <span className="text-accent">15 menit</span>{' '}
                        {t({ id: 'untuk Anda setelah mengklik tombol di bawah.', en: 'after you click the button below.' })}
                      </p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{t({ id: 'Reassurance', en: 'Reassurance' })}</p>
                    <p className="text-[11px] font-bold text-primary/60 leading-relaxed">
                      {t({ id: '100% transaksi aman & terenkripsi. Gratis reschedule sesuai kebijakan.', en: '100% secure & encrypted. Free reschedule per policy.' })}
                    </p>
                  </div>
                  <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-2xl border-primary/20 bg-white/70 font-black uppercase tracking-[0.15em] text-primary hover:bg-white"
                      >
                        {t({ id: 'Pilih Metode Pembayaran', en: 'Choose Payment Method' })}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-white/80">
                      <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                        <DialogHeader className="space-y-2 text-left">
                          <DialogTitle className="font-black text-xl text-primary tracking-tight">{t({ id: 'Metode Pembayaran', en: 'Payment Method' })}</DialogTitle>
                          <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                            {t({ id: 'Pilih metode yang paling nyaman', en: 'Choose the most convenient method' })}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {paymentMethods.map((method) => (
                            <button
                              key={method.id}
                              type="button"
                              onClick={() => {
                                setSelectedPaymentMethod(method.id);
                                if (method.id !== 'credit_card') {
                                  setCardNumber('');
                                  setCardExp('');
                                  setCardCvv('');
                                  setCardToken('');
                                }
                              }}
                              className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 hover:-translate-y-0.5 ${selectedPaymentMethod === method.id ? 'border-accent/70 bg-accent/[0.04] shadow-md ring-2 ring-accent/10' : 'border-primary/10 bg-white/70 hover:border-accent/30 hover:bg-white'}`}
                            >
                              {(() => {
                                const brand = getPaymentBrandMeta(method);
                                const logoSrc = getPaymentLogoSrc(method);
                                const showLogo = !!logoSrc && !logoLoadFailed[method.id];
                                return (
                                  <div className="w-16 h-10 rounded-xl bg-transparent flex items-center justify-center overflow-hidden px-2">
                                    {showLogo ? (
                                      <img
                                        src={logoSrc}
                                        alt={`${method.label} logo`}
                                        className="max-w-[52px] max-h-7 object-contain"
                                        onError={() => setLogoLoadFailed((prev) => ({ ...prev, [method.id]: true }))}
                                      />
                                    ) : (
                                      <span className={`inline-flex h-6 min-w-[2.5rem] px-2 items-center justify-center rounded-md bg-gradient-to-r ${brand.badge} text-white text-[10px] font-black tracking-wide`}>
                                        {brand.short}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                              <div className="flex-1">
                                <p className="text-sm font-black text-primary leading-tight">{getPaymentDisplayName(method)}</p>
                                {selectedPaymentMethod === method.id ? (
                                  <p className="mt-1 text-[9px] font-black uppercase tracking-wider text-accent">
                                    Selected
                                  </p>
                                ) : null}
                              </div>
                            </button>
                          ))}
                        </div>

                        {selectedPaymentMethod === 'credit_card' && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                              placeholder="Card Number"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              className="rounded-2xl bg-white/70 border-white/70"
                            />
                            <Input
                              placeholder="MM/YY"
                              value={cardExp}
                              onChange={(e) => setCardExp(e.target.value)}
                              className="rounded-2xl bg-white/70 border-white/70"
                            />
                            <Input
                              placeholder="CVV"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              className="rounded-2xl bg-white/70 border-white/70"
                            />
                            <Input
                              placeholder="Card Token"
                              value={cardToken}
                              onChange={(e) => setCardToken(e.target.value)}
                              className="rounded-2xl bg-white/70 border-white/70 md:col-span-3"
                            />
                            <p className="text-xs text-primary/50 md:col-span-3">
                              Card token must be generated client-side using Midtrans Card Tokenization.
                            </p>
                          </div>
                        )}

                        <Button
                          type="button"
                          className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.15em]"
                          onClick={() => setIsPaymentModalOpen(false)}
                        >
                          {t({ id: 'Simpan Pilihan', en: 'Save Selection' })}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="p-4 bg-white/70 rounded-2xl border border-primary/10 space-y-3">
                    <div className="flex items-start">
                      <p className="text-[9px] font-black text-primary/50 uppercase tracking-widest leading-relaxed">
                        {t({ id: 'Metode Pembayaran Terpilih', en: 'Selected Payment Method' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {selectedPaymentBrand && (
                        <div className="inline-flex h-9 min-w-[5.25rem] px-3 items-center justify-center rounded-lg bg-transparent overflow-hidden shrink-0">
                          {selectedPaymentLogo && !logoLoadFailed[selectedPaymentMethod] ? (
                            <img
                              src={selectedPaymentLogo}
                              alt={`${selectedPaymentMethodData?.label || 'Payment method'} logo`}
                              className="max-w-[72px] max-h-7 object-contain"
                              onError={() => setLogoLoadFailed((prev) => ({ ...prev, [selectedPaymentMethod]: true }))}
                            />
                          ) : (
                            <span className={`inline-flex h-7 px-2.5 items-center justify-center rounded-md bg-gradient-to-r ${selectedPaymentBrand.badge} text-white text-[11px] font-black tracking-wide`}>
                              {selectedPaymentBrand.short}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-[1.03] transition-all"
                    size="lg"
                    form="booking-form"
                    type="submit"
                    disabled={isBooking || !priceData || !selectedPaymentMethod || !form.formState.isValid}
                  >
                    {isBooking ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t({ id: 'Processing...', en: 'Processing...' })}
                      </span>
                    ) : (
                      t({ id: 'Complete Booking', en: 'Complete Booking' })
                    )}
                  </Button>
                  {(!selectedPaymentMethod || !form.formState.isValid) && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 text-center">
                      {!selectedPaymentMethod
                        ? t({ id: 'Pilih metode pembayaran dulu', en: 'Select payment method first' })
                        : t({ id: 'Lengkapi data tamu yang wajib', en: 'Complete required guest information' })}
                    </p>
                  )}
              </div>
              <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/30"><Shield size={10} /> {t({ id: 'Transaksi Aman & Terenkripsi', en: 'Secure & Encrypted Transaction' })}</div>
          </div>
      </div>
    </div>
    </div>
    <Dialog open={showPaymentInstructionModal} onOpenChange={setShowPaymentInstructionModal}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader className="text-left">
          <DialogTitle className="font-black text-xl text-primary">
            {t({ id: 'Instruksi Pembayaran Siap', en: 'Payment Instructions Ready' })}
          </DialogTitle>
          <DialogDescription className="text-sm text-primary/70">
            {t({ id: 'Booking berhasil dibuat. Lanjutkan pembayaran sekarang agar pesanan tidak hangus.', en: 'Booking is created. Complete payment now to secure your booking.' })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {paymentInstruction?.va_numbers?.[0] && (
            <p className="text-sm text-primary">
              <span className="font-black uppercase mr-2">{paymentInstruction.va_numbers[0].bank}</span>
              <span className="font-mono">{paymentInstruction.va_numbers[0].va_number}</span>
            </p>
          )}
          {paymentInstruction?.payment_code && (
            <p className="text-sm text-primary">
              <span className="font-black uppercase mr-2">{paymentInstruction.store || 'CStore'}</span>
              <span className="font-mono">{paymentInstruction.payment_code}</span>
            </p>
          )}
        </div>
        <Button
          type="button"
          className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.12em]"
          onClick={() => {
            setShowPaymentInstructionModal(false);
            scrollToPaymentInstruction();
          }}
        >
          {t({ id: 'Lihat Instruksi Sekarang', en: 'See Instructions Now' })}
        </Button>
        {createdBookingId && (
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 rounded-2xl font-black uppercase tracking-[0.12em]"
            onClick={() => {
              setShowPaymentInstructionModal(false);
              goToStatusPage();
            }}
          >
            {t({ id: 'Pantau Status Pembayaran', en: 'Track Payment Status' })}
          </Button>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}

export default function BookingPage() {
    const { t } = useI18n();
    return (
        <Suspense fallback={<div>{t({ id: 'Memuat halaman booking...', en: 'Loading booking page...' })}</div>}>
            <BookingContent />
        </Suspense>
    );
}
