'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

const getErrorMessage = (err: unknown) => {
  const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
  return anyErr?.response?.data?.message || anyErr?.message || 'Google login failed.';
};

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect') || '/';

    if (!token) {
      toast.error('Google login failed: missing token.');
      router.replace(`/login?error=${encodeURIComponent('Google login failed. Please try again.')}`);
      return;
    }

    // Persist token so axios interceptor attaches it for the profile call.
    localStorage.setItem('token', token);

    (async () => {
      try {
        const { data } = await api.get('/profile');
        const user = data?.data?.user;

        if (!user) {
          throw new Error('Profile not found');
        }

        login(user, token);

        if (user.role === 'partner') {
          router.replace('/partner/dashboard');
          return;
        }
        if (user.role === 'admin') {
          router.replace('/admin/dashboard');
          return;
        }

        router.replace(redirect);
      } catch (e: unknown) {
        localStorage.removeItem('token');
        toast.error(getErrorMessage(e));
        router.replace(`/login?error=${encodeURIComponent('Google login failed. Please try again.')}`);
      }
    })();
  }, [login, router, searchParams]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-xs font-black uppercase tracking-widest text-primary/40">Signing you in…</p>
    </div>
  );
}
