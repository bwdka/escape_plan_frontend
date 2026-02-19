'use client';

import { Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { AuthService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const redirectPath = searchParams.get('from') || '/';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await AuthService.login(data);
      
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
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-primary/20" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Verifying...' : 'Access Account'}
          </Button>
        </form>
      </Form>

      <div className="mt-8 pt-8 border-t border-primary/5 text-center">
          <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-4">Don't have an account?</p>
          <Link href="/register" className="font-black text-sm text-accent hover:underline underline-offset-4 decoration-2 transition-all">
            JOIN THE ESCAPE
          </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="glass p-10 rounded-[2.5rem] border-white/40 shadow-2xl space-y-8">
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
