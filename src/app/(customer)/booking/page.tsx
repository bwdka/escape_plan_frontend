'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCalculatePriceQuery, useCreateBooking } from '@/hooks/useBooking';
import { useProfile } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea'; // Assuming you might have/need this, else Input is fine
import { toast } from 'sonner';
import { Loader2, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { FaCampground } from 'react-icons/fa';

// Simple types for the form
const bookingSchema = z.object({
  customer_name: z.string().min(3, "Name required"),
  customer_email: z.string().email(),
  customer_phone: z.string().min(10),
  special_request: z.string().optional(),
  check_in: z.string().refine(val => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return new Date(val) >= today;
  }, "Must be today or future"),
  check_out: z.string(),
  total_guests: z.number().min(1),
}).refine(data => new Date(data.check_out) > new Date(data.check_in), {
    message: "Check-out must be after check-in",
    path: ["check_out"]
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const unitId = Number(searchParams.get('unit_id'));
  const unitName = searchParams.get('unit_name');
  const basePrice = Number(searchParams.get('price'));
  const checkInParam = searchParams.get('check_in') || '';
  const checkOutParam = searchParams.get('check_out') || '';

  const { data: userProfile } = useProfile();

  // Mock addons for demo - in real app, fetch these from glamping detail or a separate API
  const [selectedAddons, setSelectedAddons] = useState<{id: number, qty: number}[]>([]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customer_name: userProfile?.name || '',
      customer_email: userProfile?.email || '',
      customer_phone: userProfile?.phone || '',
      special_request: '',
      check_in: checkInParam,
      check_out: checkOutParam,
      total_guests: 2,
    }
  });

  const { data: priceData, isLoading: isCalculating, error: calculationError } = useCalculatePriceQuery({
    unit_id: unitId,
    check_in: form.watch('check_in'),
    check_out: form.watch('check_out'),
    quantity: 1,
    addons: selectedAddons,
    promo_code: '',
    enabled: !!unitId && !!form.watch('check_in') && !!form.watch('check_out')
  });

  const { mutate: createBooking, isPending: isBooking } = useCreateBooking();

  // Re-sync form with user profile and params when they load
  useEffect(() => {
    if (userProfile) {
        form.setValue('customer_name', userProfile.name);
        form.setValue('customer_email', userProfile.email);
        form.setValue('customer_phone', userProfile.phone || '');
    }
    if (checkInParam) form.setValue('check_in', checkInParam);
    if (checkOutParam) form.setValue('check_out', checkOutParam);
  }, [userProfile, checkInParam, checkOutParam, form]);

  const checkIn = form.watch('check_in');
  const checkOut = form.watch('check_out');

  const onSubmit = (data: BookingFormValues) => {
    if (!unitId) return;

    createBooking({
        unit_id: unitId,
        ...data,
        addons: selectedAddons,
        quantity: 1 // Renamed from qty to quantity for backend compatibility
    } as any, { 
 // Type casting for prototype speed
        onSuccess: (res: any) => {
            toast.success("Booking Created!");
            
            if (res.snap_token) {
                window.snap.pay(res.snap_token, {
                    onSuccess: function(result: any) {
                        toast.success("Payment success!");
                        router.push('/bookings/my-trips');
                    },
                    onPending: function(result: any) {
                        toast.info("Waiting for payment...");
                        router.push('/bookings/my-trips');
                    },
                    onError: function(result: any) {
                        toast.error("Payment failed!");
                    },
                    onClose: function() {
                        toast.warning("You closed the payment popup.");
                    }
                });
            } else if (res.payment_url) {
                window.location.href = res.payment_url;
            } else {
                router.push('/bookings/my-trips');
            }
        },
        onError: (err: any) => {
             toast.error(err.response?.data?.message || "Booking failed");
        }
    });
  };

  if (!unitId) return <div className="p-8 text-center">Invalid Booking Session</div>;

  return (
    <div className="container mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16 max-w-6xl">
      <div className="lg:col-span-2 space-y-10">
        <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-primary tracking-tighter">Secure Booking</h1>
            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Provide your details to confirm escape</p>
        </div>
        
        <div className="glass p-10 rounded-[3rem] border-white/40 space-y-10 shadow-xl">
            <div className="space-y-6">
                <h3 className="font-black text-xl text-primary tracking-tight">Your Details</h3>
                <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Stay Period</Label>
                             <div className="grid grid-cols-2 gap-px bg-primary/10 rounded-xl overflow-hidden border border-primary/5">
                                 <input 
                                    type="date" 
                                    {...form.register('check_in')} 
                                    min={new Date().toISOString().split('T')[0]}
                                    className="bg-white/50 p-3 text-xs font-black text-primary outline-none" 
                                 />
                                 <input 
                                    type="date" 
                                    {...form.register('check_out')} 
                                    min={form.watch('check_in') || new Date().toISOString().split('T')[0]}
                                    className="bg-white/50 p-3 text-xs font-black text-primary outline-none" 
                                 />
                             </div>
                             {form.formState.errors.check_in && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.check_in.message}</p>}
                             {form.formState.errors.check_out && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.check_out.message}</p>}
                         </div>
                         <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Explorers</Label>
                             <Input type="number" {...form.register('total_guests', { valueAsNumber: true })} className="h-11" />
                         </div>
                    </div>
                    
                    <div className="pt-6 border-t border-primary/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Lead Guest Name</Label>
                            <Input placeholder="Full Name" {...form.register('customer_name')} />
                             {form.formState.errors.customer_name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.customer_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Mobile Number</Label>
                            <Input placeholder="081..." {...form.register('customer_phone')} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Electronic Mail</Label>
                            <Input type="email" placeholder="email@example.com" {...form.register('customer_email')} />
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Special Preferences</Label>
                            <Textarea placeholder="Dietary needs, arrival time, etc." {...form.register('special_request')} className="rounded-2xl bg-white/50 border-primary/5 min-h-[100px]" />
                        </div>
                    </div>
                 </form>
            </div>
        </div>

        <div className="glass p-10 rounded-[3rem] border-white/40 shadow-xl space-y-6">
            <h3 className="font-black text-xl text-primary tracking-tight">Enhance Your Escape</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white border border-black/5 hover:border-accent/30 transition-all group">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <FaCampground />
                        </div>
                        <div>
                            <p className="font-black text-primary">BBQ Feast Kit (4 Pax)</p>
                            <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Rp 150.000 / kit</p>
                        </div>
                    </div>
                    <Button 
                        variant={selectedAddons.find(a => a.id === 1) ? "default" : "outline"}
                        size="sm"
                        className="rounded-full px-6"
                        onClick={() => {
                            const exists = selectedAddons.find(a => a.id === 1);
                            if (exists) {
                                setSelectedAddons(selectedAddons.filter(a => a.id !== 1));
                            } else {
                                setSelectedAddons([...selectedAddons, { id: 1, qty: 1 }]);
                            }
                        }}
                    >
                        {selectedAddons.find(a => a.id === 1) ? 'Included' : 'Add to Trip'}
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <div className="relative">
          <div className="sticky top-32 glass p-10 rounded-[3rem] border-white/40 shadow-2xl space-y-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16" />
              
              <h3 className="font-black text-xl text-primary tracking-tight relative">Reservation Summary</h3>
              
              <div className="relative space-y-6">
                  <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">Sanctuary</span>
                      <span className="font-black text-primary text-right">{unitName}</span>
                  </div>
                  <div className="h-px bg-primary/5" />
                  
                  {isCalculating ? (
                      <div className="flex justify-center py-10"><Loader2 className="animate-spin text-accent" /></div>
                  ) : calculationError ? (
                      <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                          <p className="text-[10px] font-bold text-red-500 uppercase leading-relaxed">
                              {(calculationError as any).response?.data?.message || "Invalid dates or availability"}
                          </p>
                      </div>
                  ) : priceData ? (
                      <div className="space-y-4">
                          {priceData.breakdown.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-primary/60">{item.label}</span>
                                  <span className="text-sm font-black text-primary">Rp {item.value.toLocaleString('id-ID')}</span>
                              </div>
                          ))}
                          <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-accent">Enhancements</span>
                              <span className="text-sm font-black text-accent">Rp {priceData.addons_price.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="pt-6 mt-6 border-t-2 border-dashed border-primary/10 flex justify-between items-end">
                              <span className="font-black uppercase tracking-widest text-xs text-primary">Grand Total</span>
                              <div className="text-3xl font-black text-primary tracking-tighter">
                                  <span className="text-sm font-bold mr-1 italic text-primary/30">Rp</span>
                                  {priceData.total_price.toLocaleString('id-ID')}
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center text-primary/20 py-10">
                          <p className="text-xs font-black uppercase tracking-[0.2em]">Awaiting date selection</p>
                      </div>
                  )}
              </div>

              <Button 
                className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all" 
                size="lg" 
                form="booking-form" 
                type="submit"
                disabled={isBooking || !priceData}
              >
                  {isBooking ? 'Securing...' : 'Confirm & Pay'}
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/30">
                  <Shield size={10} /> 256-bit Encrypted Transaction
              </div>
          </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
    return (
        <Suspense fallback={<div>Loading booking...</div>}>
            <BookingContent />
        </Suspense>
    );
}
