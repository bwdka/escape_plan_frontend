'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { useI18n } from '@/i18n/I18nProvider';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const login = useAuthStore((state) => state.login);
  const [message, setMessage] = useState<string>(t({ id: 'Menghubungkan akun Google...', en: 'Connecting Google account...' }));

  useEffect(() => {
    const token = searchParams.get('token');
    const redirect = searchParams.get('redirect') || '/';

    const run = async () => {
      if (!token) {
        setMessage(t({ id: 'Token tidak ditemukan.', en: 'Token not found.' }));
        setTimeout(() => router.push('/login'), 1200);
        return;
      }

      localStorage.setItem('token', token);

      try {
        const profile = await AuthService.getProfile();
        const user = profile?.user;
        if (!user) {
          throw new Error('Missing profile');
        }

        login(user, token);

        if (user.role === 'partner') {
          router.push('/partner/dashboard');
        } else if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (redirect.startsWith('/')) {
          router.push(redirect);
        } else {
          router.push('/');
        }
      } catch {
        setMessage(t({ id: 'Gagal memverifikasi akun Google.', en: 'Failed to verify Google account.' }));
        localStorage.removeItem('token');
        setTimeout(() => router.push('/login'), 1200);
      }
    };

    run();
  }, [login, router, searchParams, t]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center text-center">
      <div className="glass px-6 py-4 rounded-2xl border-white/40 text-primary/60 text-sm font-bold uppercase tracking-widest">
        {message}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div>Connecting...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
