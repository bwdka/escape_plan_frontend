'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCalculatePrice, useCreateBooking } from '@/hooks/useBooking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea'; // Assuming you might have/need this, else Input is fine
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

// Simple types for the form
const bookingSchema = z.object({
  customer_name: z.string().min(3, "Name required"),
  customer_email: z.string().email(),
  customer_phone: z.string().min(10),
  special_request: z.string().optional(),
  check_in: z.string().refine(val => new Date(val) > new Date(), "Must be future date"),
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

  const { mutate: calculatePrice, data: priceData, isPending: isCalculating } = useCalculatePrice();
  const { mutate: createBooking, isPending: isBooking } = useCreateBooking();

  // Mock addons for demo - in real app, fetch these from glamping detail or a separate API
  const [selectedAddons, setSelectedAddons] = useState<{id: number, qty: number}[]>([]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      special_request: '',
      check_in: '',
      check_out: '',
      total_guests: 2,
    }
  });

  const watchDates = form.watch(['check_in', 'check_out']);

  // Recalculate price when dates or addons change
  useEffect(() => {
    const [checkIn, checkOut] = watchDates;
    if (checkIn && checkOut && unitId) {
        calculatePrice({
            unit_id: unitId,
            check_in: checkIn,
            check_out: checkOut,
            quantity: 1, // Default 1 unit
            addons: selectedAddons,
            promo_code: ''
        });
    }
  }, [watchDates, selectedAddons, unitId, calculatePrice]);

  const onSubmit = (data: BookingFormValues) => {
    if (!unitId) return;

    createBooking({
        unit_id: unitId,
        ...data,
        addons: selectedAddons,
        qty: 1 // Assuming 1 unit for simplicity in this prototype
    } as any, { // Type casting for prototype speed
        onSuccess: (res) => {
            toast.success("Booking Created!");
            // Redirect to payment URL or confirmation page
            if (res.payment_url) {
                window.location.href = res.payment_url;
            } else {
                router.push('/booking/success');
            }
        },
        onError: (err: any) => {
             toast.error(err.response?.data?.message || "Booking failed");
        }
    });
  };

  if (!unitId) return <div className="p-8 text-center">Invalid Booking Session</div>;

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <h1 className="text-2xl font-bold">Request to Book</h1>
        
        <Card>
            <CardHeader>
                <CardTitle>Your Details</CardTitle>
            </CardHeader>
            <CardContent>
                 <form id="booking-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <Label>Dates</Label>
                             <div className="grid grid-cols-2 gap-2">
                                 <Input type="date" {...form.register('check_in')} />
                                 <Input type="date" {...form.register('check_out')} />
                             </div>
                             {form.formState.errors.check_out && <p className="text-red-500 text-xs">{form.formState.errors.check_out.message}</p>}
                         </div>
                         <div className="space-y-2">
                             <Label>Guests</Label>
                             <Input type="number" {...form.register('total_guests', { valueAsNumber: true })} />
                         </div>
                    </div>
                    
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input placeholder="Full Name" {...form.register('customer_name')} />
                             {form.formState.errors.customer_name && <p className="text-red-500 text-xs">{form.formState.errors.customer_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input placeholder="081..." {...form.register('customer_phone')} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>Email</Label>
                            <Input type="email" placeholder="email@example.com" {...form.register('customer_email')} />
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label>Special Request</Label>
                            <Input placeholder="Any special requests?" {...form.register('special_request')} />
                        </div>
                    </div>
                 </form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Add-ons</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between border p-3 rounded-lg">
                        <div>
                            <p className="font-medium">BBQ Set (4 Pax)</p>
                            <p className="text-sm text-gray-500">Rp 150.000 / package</p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                                const exists = selectedAddons.find(a => a.id === 1);
                                if (exists) {
                                    setSelectedAddons(selectedAddons.filter(a => a.id !== 1));
                                } else {
                                    setSelectedAddons([...selectedAddons, { id: 1, qty: 1 }]);
                                }
                            }}
                        >
                            {selectedAddons.find(a => a.id === 1) ? 'Remove' : 'Add'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <div>
          <Card className="sticky top-24">
              <CardHeader>
                  <CardTitle>Price Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex justify-between">
                      <span className="text-gray-600">Unit</span>
                      <span className="font-medium">{unitName}</span>
                  </div>
                  <Separator />
                  
                  {isCalculating ? (
                      <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
                  ) : priceData ? (
                      <div className="space-y-2 text-sm">
                          {priceData.breakdown.map((item, idx) => (
                              <div key={idx} className="flex justify-between">
                                  <span>{item.label}</span>
                                  <span>Rp {item.value.toLocaleString('id-ID')}</span>
                              </div>
                          ))}
                          <div className="flex justify-between text-green-600">
                              <span>Add-ons</span>
                              <span>Rp {priceData.addons_price.toLocaleString('id-ID')}</span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <span>Rp {priceData.total_price.toLocaleString('id-ID')}</span>
                          </div>
                      </div>
                  ) : (
                      <div className="text-center text-gray-400 py-4 text-sm">
                          Select dates to calculate price
                      </div>
                  )}
              </CardContent>
              <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    form="booking-form" 
                    type="submit"
                    disabled={isBooking || !priceData}
                  >
                      {isBooking ? 'Processing...' : 'Pay & Book'}
                  </Button>
              </CardFooter>
          </Card>
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
