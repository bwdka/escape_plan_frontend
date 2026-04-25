import { Suspense } from 'react';
import GoogleCallbackClient from './GoogleCallbackClient';

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-primary/40">Signing you in…</p>
        </div>
      }
    >
      <GoogleCallbackClient />
    </Suspense>
  );
}

