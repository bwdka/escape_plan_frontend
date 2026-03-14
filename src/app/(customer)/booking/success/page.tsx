'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, ArrowRight, Lock } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

type PasswordFormValues = {
  password: string;
  confirm_password: string;
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { t } = useI18n();

  const bookingId = searchParams.get('booking_id');
  const email = searchParams.get('email');

  const passwordSchema = z.object({
    password: z.string().min(8, t({ id: 'Password minimal 8 karakter', en: 'Password must be at least 8 characters' })),
    confirm_password: z.string()
  }).refine(data => data.password === data.confirm_password, {
      message: t({ id: 'Password tidak cocok', en: 'Passwords do not match' }),
      path: ["confirm_password"]
  });

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirm_password: '',
    }
  });

  const onSubmit = async (data: PasswordFormValues) => {
    if (!email) return;
    setIsSubmitting(true);
    try {
        await api.post('/bookings/set-password', {
            email: email,
            password: data.password
        });
        toast.success(t({ id: 'Password berhasil dibuat!', en: 'Password created successfully!' }));
        setIsDone(true);
    } catch (error: any) {
        toast.error(error.response?.data?.message || t({ id: 'Gagal membuat password', en: 'Failed to create password' }));
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center justify-center max-w-2xl text-center space-y-10 md:space-y-12">
      <div className="space-y-6 md:space-y-8">
          <Image 
            src="/logo/logo_escape_plan.png" 
            alt="Escape Plan Logo" 
            width={160} 
            height={50} 
            className="mx-auto opacity-80"
          />
          <div className="space-y-3 md:space-y-4">
              <div className="flex justify-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                      <CheckCircle2 size={40} className="md:w-12 md:h-12" />
                  </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tighter">{t({ id: 'Booking Berhasil!', en: 'Booking Successful!' })}</h1>
              <p className="text-sm md:text-base text-primary/60 font-medium">{t({ id: 'Terima kasih telah memilih Escape Plan. Detail pesanan telah dikirim ke email Anda.', en: 'Thank you for choosing Escape Plan. Your booking details have been sent to your email.' })}</p>
              <div className="inline-block px-6 py-2 bg-primary/5 rounded-full border border-primary/10">
                  <p className="text-xs font-black uppercase tracking-widest text-primary/40">{t({ id: 'ID Pesanan', en: 'Booking ID' })}: <span className="text-primary">ESC-{bookingId}</span></p>
              </div>
          </div>
      </div>

      {!isDone ? (
          <Card className="w-full glass border-white/40 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden text-left">
            <CardHeader className="p-6 md:p-8 lg:p-10 pb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4">
                    <Lock size={20} />
                </div>
                <CardTitle className="text-2xl font-black text-primary tracking-tight">{t({ id: 'Buat Akun Otomatis', en: 'Create an Account Automatically' })}</CardTitle>
                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">{t({ id: 'Atur password untuk mengelola pesanan ini di masa depan', en: 'Set a password to manage this booking in the future' })}</p>
            </CardHeader>
            <CardContent className="p-6 md:p-8 lg:p-10 pt-6 space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Password Baru', en: 'New Password' })}</Label>
                        <Input type="password" {...form.register('password')} className="h-12 rounded-2xl bg-white/50 border-primary/5" />
                        {form.formState.errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Konfirmasi Password', en: 'Confirm Password' })}</Label>
                        <Input type="password" {...form.register('confirm_password')} className="h-12 rounded-2xl bg-white/50 border-primary/5" />
                        {form.formState.errors.confirm_password && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.confirm_password.message}</p>}
                    </div>
                    <Button 
                        className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-all" 
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : t({ id: 'Simpan Password', en: 'Save Password' })}
                    </Button>
                </form>
                <button 
                    onClick={() => router.push('/bookings/my-trips')}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-primary/30 hover:text-primary transition-all text-center"
                >
                    {t({ id: 'Lewati, langsung ke pesanan saya', en: 'Skip, go to my bookings' })}
                </button>
            </CardContent>
          </Card>
      ) : (
          <div className="space-y-6 w-full">
              <div className="p-6 md:p-8 lg:p-10 bg-white/50 rounded-[3rem] border border-green-200 text-center space-y-4">
                  <p className="font-black text-primary text-xl">{t({ id: 'Password Berhasil Disimpan!', en: 'Password Saved Successfully!' })}</p>
                  <p className="text-sm text-primary/60">{t({ id: `Sekarang Anda bisa login menggunakan email ${email} dan password yang baru saja dibuat.`, en: `You can now log in using email ${email} and the password you just created.` })}</p>
              </div>
              <Button 
                onClick={() => router.push('/bookings/my-trips')}
                className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl"
              >
                  {t({ id: 'Lihat Pesanan Saya', en: 'View My Bookings' })} <ArrowRight className="ml-2" />
              </Button>
          </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
    const { t } = useI18n();
    return (
        <Suspense fallback={<div>{t({ id: 'Memuat...', en: 'Loading...' })}</div>}>
            <SuccessContent />
        </Suspense>
    );
}
