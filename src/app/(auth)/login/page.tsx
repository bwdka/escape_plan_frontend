'use client';

import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

import { AuthService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useI18n } from '@/i18n/I18nProvider';

type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const redirectPath = searchParams.get('redirect') || '/';
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const errorParam = searchParams.get('error');

  useEffect(() => {
    if (errorParam) {
      toast.error(errorParam);
    }
  }, [errorParam]);

  const getErrorMessage = (err: unknown) => {
    const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
    return anyErr?.response?.data?.message || anyErr?.message || t({ id: 'Terjadi kesalahan', en: 'Something went wrong' });
  };

  const loginSchema = z.object({
    email: z.string().email(t({ id: 'Email tidak valid', en: 'Invalid email address' })),
    password: z.string().min(6, t({ id: 'Password minimal 6 karakter', en: 'Password must be at least 6 characters' })),
    remember: z.boolean(),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await AuthService.login({
          email: data.email,
          password: data.password
      });
      
      if (response.data) {
        login(response.data.user, response.data.token);
        toast.success(t({ id: 'Berhasil masuk', en: 'Logged in successfully' }));
        
        // Redirect based on role or previous path
        if (response.data.user.role === 'partner') {
           router.push('/partner/dashboard');
        } else if (response.data.user.role === 'admin') {
           router.push('/admin/dashboard');
        } else {
           router.push(redirectPath);
        }
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || t({ id: 'Login gagal', en: 'Login failed' }));
      console.error(err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const response = await AuthService.getGoogleRedirectUrl(redirectPath);
      if (response?.url) {
        window.location.href = response.url;
      } else {
        toast.error(t({ id: 'Gagal membuka Google login', en: 'Failed to start Google login' }));
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || t({ id: 'Gagal membuka Google login', en: 'Failed to start Google login' }));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Alamat email', en: 'Email address' })}</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} className="rounded-xl h-12 bg-white/70 border-white/40 focus-visible:ring-primary/30" />
                </FormControl>
                <FormMessage className="text-[10px] uppercase font-bold" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">{t({ id: 'Kata sandi', en: 'Password' })}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                        className="rounded-xl h-12 pr-12 bg-white/70 border-white/40 focus-visible:ring-primary/30"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-[10px] uppercase font-bold" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between px-1">
              <FormField
                control={form.control}
                name="remember"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded-md border-primary/20"
                      />
                    </FormControl>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 cursor-pointer">
                      {t({ id: 'Ingat saya', en: 'Remember me' })}
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">
                  {t({ id: 'Lupa Password?', en: 'Forgot Password?' })}
              </Link>
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-[0_20px_60px_rgba(24,66,46,0.35)]" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t({ id: 'Memverifikasi...', en: 'Verifying...' }) : t({ id: 'Masuk Akun', en: 'Access Account' })}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-2xl border border-primary/10 bg-white/80 font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            <FcGoogle className="text-lg" />
            {isGoogleLoading ? t({ id: 'Menghubungkan...', en: 'Connecting...' }) : t({ id: 'Masuk dengan Google', en: 'Continue with Google' })}
          </Button>
        </form>
      </Form>

      <div className="mt-8 pt-8 border-t border-primary/5 text-center">
          <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">{t({ id: 'Belum punya akun?', en: "Don't have an account?" })}</p>
          <Link 
            href={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} 
            className="font-black text-sm text-accent hover:underline underline-offset-4 decoration-2 transition-all tracking-widest"
          >
            {t({ id: 'GABUNG SEKARANG', en: 'JOIN THE ESCAPE' })}
          </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  const { t } = useI18n();
  return (
    <div className="relative overflow-hidden glass p-10 md:p-12 rounded-[3rem] border-white/50 shadow-[0_25px_90px_rgba(0,0,0,0.18)] space-y-8 max-w-md mx-auto bg-white/70 backdrop-blur-2xl">
      <div className="absolute -top-28 -right-24 w-72 h-72 bg-accent/25 blur-[140px] rounded-full" />
      <div className="absolute -bottom-28 -left-24 w-72 h-72 bg-primary/25 blur-[140px] rounded-full" />
      <div className="relative text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-white/40 text-[10px] font-black uppercase tracking-[0.25em] text-primary/60">
          {t({ id: 'Akses Premium', en: 'Premium Access' })}
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-primary">{t({ id: 'Selamat Datang Kembali.', en: 'Welcome Back.' })}</h1>
        <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">{t({ id: 'Masuk ke akun Anda', en: 'Sign in to your account' })}</p>
      </div>
      <Suspense fallback={<div>{t({ id: 'Memuat form login...', en: 'Loading login form...' })}</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
