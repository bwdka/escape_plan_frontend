'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCalculatePriceQuery, useCreateBooking } from '@/hooks/useBooking';
import { useProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Shield, Plus, Minus, AlertCircle } from 'lucide-react';
import { FaCampground, FaCoffee, FaMotorcycle } from 'react-icons/fa';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { useI18n } from '@/i18n/I18nProvider';
import { dummyBookedDates } from '@/lib/dummyBookings';

type BookingFormValues = {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  special_request?: string;
  check_in: string;
  check_out: string;
  total_guests: number;
};

function BookingContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const unitId = Number(searchParams.get('unit_id'));
  const unitName = searchParams.get('unit_name');
  const checkInParam = searchParams.get('check_in') || '';
  const checkOutParam = searchParams.get('check_out') || '';

  const { data: userProfile } = useProfile();

  const [selectedAddons, setSelectedAddons] = useState<{id: number, quantity: number, name: string, price: number, icon: any}[]>([
      { id: 1, quantity: 0, name: t({ id: 'Extra Bed', en: 'Extra Bed' }), price: 150000, icon: FaCampground },
      { id: 2, quantity: 0, name: t({ id: 'Paket BBQ (4 Pax)', en: 'BBQ Package (4 Pax)' }), price: 250000, icon: FaCoffee },
      { id: 3, quantity: 0, name: t({ id: 'Sewa ATV (2 Jam)', en: 'ATV Rental (2 Hours)' }), price: 300000, icon: FaMotorcycle },
  ]);

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
  const startDate = checkInValue ? new Date(checkInValue) : null;
  const endDate = checkOutValue ? new Date(checkOutValue) : null;

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
    enabled: !!unitId && !!form.watch('check_in') && !!form.watch('check_out')
  });

  const { mutate: createBooking, isPending: isBooking } = useCreateBooking();

  useEffect(() => {
    if (userProfile) {
        form.setValue('guest_name', userProfile.name);
        form.setValue('guest_email', userProfile.email);
        form.setValue('guest_phone', userProfile.phone || '');
    }
    if (checkInParam) form.setValue('check_in', checkInParam);
    if (checkOutParam) form.setValue('check_out', checkOutParam);
  }, [userProfile, checkInParam, checkOutParam, form]);

  const onSubmit = (data: BookingFormValues) => {
    if (!unitId) return;
    createBooking({
        unit_id: unitId,
        ...data,
        addons: activeAddons,
        quantity: 1
    }, { 
        onSuccess: (res: any) => {
            const bookingId = res.booking_id;
            const guestEmail = data.guest_email;
            if (res.snap_token && window.snap) {
                window.snap.pay(res.snap_token, {
                    onSuccess: () => {
                        toast.success(t({ id: 'Pembayaran berhasil!', en: 'Payment successful!' }));
                        router.push(`/booking/success?booking_id=${bookingId}&email=${guestEmail}`);
                    },
                    onPending: () => {
                        toast.info(t({ id: 'Menunggu pembayaran...', en: 'Waiting for payment...' }));
                        router.push(`/booking/success?booking_id=${bookingId}&email=${guestEmail}`);
                    },
                    onError: () => toast.error(t({ id: 'Pembayaran gagal!', en: 'Payment failed!' })),
                    onClose: () => toast.warning(t({ id: 'Anda menutup pop-up pembayaran.', en: 'You closed the payment popup.' }))
                });
            } else {
                toast.error(t({ id: 'Gagal membuka pembayaran. Token Midtrans tidak tersedia.', en: 'Failed to open payment. Midtrans token unavailable.' }));
            }
        },
        onError: (err: any) => toast.error(err.response?.data?.message || t({ id: 'Booking gagal dibuat', en: 'Booking creation failed' }))
    });
  };

  if (!unitId) return <div className="p-8 text-center">{t({ id: 'Sesi Booking Tidak Valid', en: 'Invalid booking session' })}</div>;

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16 max-w-6xl">
      <div className="lg:col-span-2 space-y-10">
        <div className="flex flex-col gap-6">
            <Image src="/logo/logo_escape_plan.png" alt="Escape Plan Logo" width={120} height={40} className="opacity-80 object-contain" />
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-primary tracking-tighter">{t({ id: 'Konfirmasi Pesanan', en: 'Confirm Your Booking' })}</h1>
                <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">{t({ id: 'Lengkapi data Anda untuk mengamankan tenda ini', en: 'Complete your details to secure this stay' })}</p>
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
                                    bookedDates={dummyBookedDates}
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
                             <Input type="number" {...form.register('total_guests', { valueAsNumber: true })} className="h-11 rounded-xl" />
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
                    
                    <div className="pt-6 border-t border-primary/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Nama Lengkap', en: 'Full Name' })}</Label>
                            <Input placeholder={t({ id: 'Sesuai KTP', en: 'As per ID' })} {...form.register('guest_name')} className="rounded-xl" />
                             {form.formState.errors.guest_name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.guest_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'No. WhatsApp', en: 'WhatsApp Number' })}</Label>
                            <Input placeholder="081..." {...form.register('guest_phone')} className="rounded-xl" />
                             {form.formState.errors.guest_phone && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.guest_phone.message}</p>}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Alamat Email', en: 'Email Address' })}</Label>
                            <Input type="email" placeholder="email@example.com" {...form.register('guest_email')} className="rounded-xl h-12" />
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
      </div>

      <div className="relative">
          <div className="lg:sticky lg:top-32 glass p-6 md:p-8 lg:p-10 rounded-[2.5rem] md:rounded-[3rem] border-white/40 shadow-2xl space-y-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <h3 className="font-black text-xl text-primary tracking-tight relative">{t({ id: 'Ringkasan Pesanan', en: 'Booking Summary' })}</h3>
              <div className="relative space-y-6">
                  <div className="flex justify-between items-start gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">{t({ id: 'Tenda', en: 'Unit' })}</span>
                      <span className="font-black text-primary text-right text-sm">{unitName}</span>
                  </div>
                  <div className="h-px bg-primary/5" />
                  {isCalculating ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
                  ) : calculationError ? (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-100"><p className="text-[10px] font-bold text-red-500 uppercase leading-relaxed">{(calculationError as any).response?.data?.message || t({ id: 'Kesalahan kalkulasi harga', en: 'Price calculation error' })}</p></div>
                  ) : priceData ? (
                      <div className="space-y-4">
                          {priceData.breakdown.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center"><span className="text-xs font-bold text-primary/60">{item.label}</span><span className="text-sm font-black text-primary">Rp {item.value.toLocaleString('id-ID')}</span></div>
                          ))}
                          <div className="pt-4 mt-4 border-t border-primary/5 flex justify-between items-center"><span className="text-xs font-black uppercase text-primary/40">{t({ id: 'Subtotal', en: 'Subtotal' })}</span><span className="text-lg font-black text-primary">Rp {(priceData as any).attractive_price?.toLocaleString('id-ID') ?? '0'}</span></div>
                          <div className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-bold text-primary/40 uppercase tracking-widest"><span>{t({ id: 'Pajak (PPN 11%)', en: 'Tax (VAT 11%)' })}</span><span>Rp {priceData.tax_amount.toLocaleString('id-ID')}</span></div>
                              <div className="flex justify-between items-center text-[10px] font-bold text-primary/40 uppercase tracking-widest"><span>{t({ id: 'Biaya Aplikasi', en: 'Service Fee' })}</span><span>Rp {priceData.service_fee.toLocaleString('id-ID')}</span></div>
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
                  <div className="p-4 bg-accent/5 rounded-2xl border border-accent/10">
                      <p className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">{t({ id: 'Inventory Hold', en: 'Inventory Hold' })}</p>
                      <p className="text-[11px] font-bold text-primary/60 leading-relaxed">
                        {t({ id: 'Tenda akan dikunci selama', en: 'This unit will be held for' })}{' '}
                        <span className="text-accent">15 menit</span>{' '}
                        {t({ id: 'untuk Anda setelah mengklik tombol di bawah.', en: 'after you click the button below.' })}
                      </p>
                  </div>
                  <Button className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all" size="lg" form="booking-form" type="submit" disabled={isBooking || !priceData}>{isBooking ? t({ id: 'Menyiapkan...', en: 'Preparing...' }) : t({ id: 'Konfirmasi & Bayar', en: 'Confirm & Pay' })}</Button>
              </div>
              <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/30"><Shield size={10} /> {t({ id: 'Transaksi Aman & Terenkripsi', en: 'Secure & Encrypted Transaction' })}</div>
          </div>
      </div>
    </div>
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
