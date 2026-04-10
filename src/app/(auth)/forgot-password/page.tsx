'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

type ForgotPasswordValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const forgotPasswordSchema = z.object({
    email: z.string().email(t({ id: 'Email tidak valid', en: 'Invalid email address' })),
  });

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setIsSubmitted(true);
      toast.success(t({ id: 'Link reset dikirim ke email Anda', en: 'Reset link sent to your email' }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t({ id: 'Terjadi kesalahan', en: 'Something went wrong' }));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="glass p-10 rounded-[3rem] border-white/50 shadow-[0_25px_90px_rgba(0,0,0,0.18)] space-y-8 max-w-md mx-auto text-center bg-white/70 backdrop-blur-2xl">
        <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 size={40} />
            </div>
        </div>
        <div className="space-y-2">
            <h1 className="text-2xl font-black text-primary tracking-tight">{t({ id: 'Periksa Email Anda', en: 'Check Your Email' })}</h1>
            <p className="text-sm font-medium text-primary/60">
                {t({
                  id: 'Kami telah mengirim instruksi reset password ke email Anda.',
                  en: "We've sent password reset instructions to your email address."
                })}
            </p>
        </div>
        <Button 
            asChild
            variant="outline"
            className="w-full rounded-2xl border-primary/10 font-black uppercase tracking-widest text-xs h-12 bg-white/60"
        >
            <Link href="/login">{t({ id: 'Kembali ke Login', en: 'Return to Login' })}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="glass p-10 rounded-[3rem] border-white/50 shadow-[0_25px_90px_rgba(0,0,0,0.18)] space-y-8 max-w-md mx-auto bg-white/70 backdrop-blur-2xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-primary">{t({ id: 'Lupa Password?', en: 'Forgot Password?' })}</h1>
        <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">{t({ id: 'Masukkan email untuk reset', en: 'Enter your email to reset' })}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Alamat email', en: 'Email address' })}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="you@example.com" {...field} className="rounded-xl h-12 pl-12 bg-white/70 border-white/40 focus-visible:ring-primary/30" />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px] uppercase font-bold" />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-[0_20px_60px_rgba(24,66,46,0.35)]" 
            disabled={isLoading}
          >
            {isLoading ? t({ id: 'Mengirim...', en: 'Sending...' }) : t({ id: 'Kirim Link Reset', en: 'Send Reset Link' })}
          </Button>
        </form>
      </Form>

      <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors">
              <ArrowLeft size={12} /> {t({ id: 'Kembali ke Login', en: 'Back to Login' })}
          </Link>
      </div>
    </div>
  );
}
