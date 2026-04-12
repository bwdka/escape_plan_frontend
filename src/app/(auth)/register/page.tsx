'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';

import { AuthService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useI18n } from '@/i18n/I18nProvider';
import { cn } from '@/lib/utils';

type RegisterFormValues = {
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'partner';
  password: string;
  password_confirmation: string;
};

function RegisterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const redirectPath = searchParams.get('redirect') || '/';
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const registerSchema = z.object({
    name: z.string().min(2, t({ id: 'Nama minimal 2 karakter', en: 'Name must be at least 2 characters' })),
    email: z.string().email(t({ id: 'Email tidak valid', en: 'Invalid email address' })),
    phone: z.string().min(10, t({ id: 'Nomor telepon tidak valid', en: 'Phone number must be valid' })),
    role: z.enum(['customer', 'partner']), // Select between customer or partner
    password: z.string().min(6, t({ id: 'Password minimal 6 karakter', en: 'Password must be at least 6 characters' })),
    password_confirmation: z.string(),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t({ id: 'Password tidak sama', en: "Passwords don't match" }),
    path: ["password_confirmation"],
  });

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await AuthService.register(data);
      
      if (response.data) {
        login(response.data.user, response.data.token);
        toast.success(t({ id: 'Akun berhasil dibuat', en: 'Account created successfully' }));
        
        if (response.data.user.role === 'partner') {
           router.push('/partner/dashboard');
        } else {
           router.push(redirectPath);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 422 && error.response.data.errors) {
         const errors = error.response.data.errors;
         Object.keys(errors).forEach((key) => {
            // @ts-ignore
            form.setError(key, { message: errors[key][0] });
         });
      } else {
         toast.error(error.response?.data?.message || t({ id: 'Registrasi gagal', en: 'Registration failed' }));
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      const role = form.getValues('role');
      const response = await AuthService.getGoogleRedirectUrl(redirectPath, role);
      if (response?.url) {
        window.location.href = response.url;
      } else {
        toast.error(t({ id: 'Gagal membuka Google login', en: 'Failed to start Google login' }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t({ id: 'Gagal membuka Google login', en: 'Failed to start Google login' }));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                      {t({ id: 'Nama Lengkap', en: 'Full Name' })}
                    </FormLabel>
                    <FormControl>
                    <Input placeholder="John Doe" {...field} className="rounded-xl h-12 bg-white/70 border-white/40 focus-visible:ring-primary/30" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                      {t({ id: 'Email', en: 'Email' })}
                    </FormLabel>
                    <FormControl>
                    <Input placeholder="john@example.com" {...field} className="rounded-xl h-12 bg-white/70 border-white/40 focus-visible:ring-primary/30" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                      {t({ id: 'Nomor Telepon', en: 'Phone Number' })}
                    </FormLabel>
                    <FormControl>
                    <Input placeholder="08123456789" {...field} className="rounded-xl h-12 bg-white/70 border-white/40 focus-visible:ring-primary/30" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                      {t({ id: 'Saya ingin bergabung sebagai', en: 'I want to join as' })}
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2 bg-black/5 p-1 rounded-xl h-12">
                        <button
                          type="button"
                          onClick={() => field.onChange('customer')}
                          className={cn(
                            "rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                            field.value === 'customer' 
                              ? "bg-white text-primary shadow-sm" 
                              : "text-primary/40 hover:text-primary/60"
                          )}
                        >
                          {t({ id: 'Tamu', en: 'Guest' })}
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange('partner')}
                          className={cn(
                            "rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                            field.value === 'partner' 
                              ? "bg-white text-primary shadow-sm" 
                              : "text-primary/40 hover:text-primary/60"
                          )}
                        >
                          {t({ id: 'Partner', en: 'Partner' })}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                      {t({ id: 'Kata Sandi', en: 'Password' })}
                    </FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="rounded-xl h-12 bg-white/70 border-white/40 focus-visible:ring-primary/30" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">
                      {t({ id: 'Konfirmasi Password', en: 'Confirm Password' })}
                    </FormLabel>
                    <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="rounded-xl h-12 bg-white/70 border-white/40 focus-visible:ring-primary/30" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_20px_60px_rgba(24,66,46,0.35)] mt-4" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t({ id: 'Memproses...', en: 'Onboarding...' }) : t({ id: 'Mulai Perjalananku', en: 'Start My Journey' })}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-xl border border-primary/10 bg-white/80 font-black uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-3"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            <FcGoogle className="text-lg" />
            {isGoogleLoading ? t({ id: 'Menghubungkan...', en: 'Connecting...' }) : t({ id: 'Daftar dengan Google', en: 'Continue with Google' })}
          </Button>
        </form>
      </Form>

       <div className="mt-8 pt-8 border-t border-primary/5 text-center">
         <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">
           {t({ id: 'Sudah punya akun?', en: 'Already a member?' })}
         </p>
         <Link 
            href={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} 
            className="font-black text-sm text-accent hover:underline underline-offset-4 decoration-2 transition-all"
         >
            {t({ id: 'MASUK SAJA', en: 'SIGN IN INSTEAD' })}
         </Link>
      </div>
    </>
  );
}

export default function RegisterPage() {
  const { t } = useI18n();
  return (
    <div className="glass p-10 rounded-[2.75rem] border-white/50 shadow-[0_25px_90px_rgba(0,0,0,0.18)] space-y-8 bg-white/70 backdrop-blur-2xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-primary">{t({ id: 'Gabung ke Escape.', en: 'Join the Escape.' })}</h1>
        <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">{t({ id: 'Buat akun premium Anda', en: 'Create your luxury account' })}</p>
      </div>
      <Suspense fallback={<div>{t({ id: 'Memuat form...', en: 'Loading form...' })}</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
