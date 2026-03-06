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

const passwordSchema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirm_password: z.string()
}).refine(data => data.password === data.confirm_password, {
    message: "Password tidak cocok",
    path: ["confirm_password"]
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const bookingId = searchParams.get('booking_id');
  const email = searchParams.get('email');

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
        toast.success("Password berhasil dibuat!");
        setIsDone(true);
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Gagal membuat password");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center max-w-2xl text-center space-y-12">
      <div className="space-y-8">
          <Image 
            src="/logo/logo_escape_plan.png" 
            alt="Escape Plan Logo" 
            width={160} 
            height={50} 
            className="mx-auto opacity-80"
          />
          <div className="space-y-4">
              <div className="flex justify-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-bounce">
                      <CheckCircle2 size={48} />
                  </div>
              </div>
              <h1 className="text-4xl font-black text-primary tracking-tighter">Booking Berhasil!</h1>
              <p className="text-primary/60 font-medium">Terima kasih telah memilih Escape Plan. Detail pesanan telah dikirim ke email Anda.</p>
              <div className="inline-block px-6 py-2 bg-primary/5 rounded-full border border-primary/10">
                  <p className="text-xs font-black uppercase tracking-widest text-primary/40">ID Pesanan: <span className="text-primary">ESC-{bookingId}</span></p>
              </div>
          </div>
      </div>

      {!isDone ? (
          <Card className="w-full glass border-white/40 shadow-2xl rounded-[3rem] overflow-hidden text-left">
            <CardHeader className="p-10 pb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent mb-4">
                    <Lock size={20} />
                </div>
                <CardTitle className="text-2xl font-black text-primary tracking-tight">Buat Akun Otomatis</CardTitle>
                <p className="text-xs font-bold text-primary/40 uppercase tracking-widest">Atur password untuk mengelola pesanan ini di masa depan</p>
            </CardHeader>
            <CardContent className="p-10 pt-6 space-y-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Password Baru</Label>
                        <Input type="password" {...form.register('password')} className="h-12 rounded-2xl bg-white/50 border-primary/5" />
                        {form.formState.errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.password.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Konfirmasi Password</Label>
                        <Input type="password" {...form.register('confirm_password')} className="h-12 rounded-2xl bg-white/50 border-primary/5" />
                        {form.formState.errors.confirm_password && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{form.formState.errors.confirm_password.message}</p>}
                    </div>
                    <Button 
                        className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-all" 
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : 'Simpan Password'}
                    </Button>
                </form>
                <button 
                    onClick={() => router.push('/bookings/my-trips')}
                    className="w-full text-[10px] font-black uppercase tracking-widest text-primary/30 hover:text-primary transition-all text-center"
                >
                    Lewati, langsung ke pesanan saya
                </button>
            </CardContent>
          </Card>
      ) : (
          <div className="space-y-6 w-full">
              <div className="p-10 bg-white/50 rounded-[3rem] border border-green-200 text-center space-y-4">
                  <p className="font-black text-primary text-xl">Password Berhasil Disimpan!</p>
                  <p className="text-sm text-primary/60">Sekarang Anda bisa login menggunakan email <span className="font-bold">{email}</span> dan password yang baru saja dibuat.</p>
              </div>
              <Button 
                onClick={() => router.push('/bookings/my-trips')}
                className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] shadow-xl"
              >
                  Lihat Pesanan Saya <ArrowRight className="ml-2" />
              </Button>
          </div>
      )}
    </div>
  );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Memuat...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
