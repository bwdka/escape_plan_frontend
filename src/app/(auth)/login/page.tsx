'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

import { AuthService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const redirectPath = searchParams.get('redirect') || '/';
  const [showPassword, setShowPassword] = useState(false);

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
        toast.success('Logged in successfully');
        
        // Redirect based on role or previous path
        if (response.data.user.role === 'partner') {
           router.push('/partner/dashboard');
        } else if (response.data.user.role === 'admin') {
           router.push('/admin/dashboard');
        } else {
           router.push(redirectPath);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      console.error(error);
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
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Email address</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} className="rounded-xl h-12" />
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
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-1">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                        className="rounded-xl h-12 pr-12"
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
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">
                  Forgot Password?
              </Link>
          </div>

          <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-xl shadow-primary/20" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Verifying...' : 'Access Account'}
          </Button>
        </form>
      </Form>

      <div className="mt-8 pt-8 border-t border-primary/5 text-center">
          <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">Don&apos;t have an account?</p>
          <Link 
            href={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} 
            className="font-black text-sm text-accent hover:underline underline-offset-4 decoration-2 transition-all tracking-widest"
          >
            JOIN THE ESCAPE
          </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="glass p-10 rounded-[3rem] border-white/40 shadow-2xl space-y-8 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-primary">Welcome Back.</h1>
        <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Sign in to your account</p>
      </div>
      <Suspense fallback={<div>Loading login form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
