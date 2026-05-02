'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

// This page receives the tokens from the NestJS Google OAuth callback,
// stores them in the auth store, then redirects to the dashboard.
import { Suspense } from 'react';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <AuthCallbackContent />
    </Suspense>
  );
}

function CallbackLoading() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #102A43 0%, #1B3A52 100%)' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin" aria-hidden="true" />
        <p className="text-white font-semibold text-sm tracking-wide">Loading…</p>
      </div>
    </main>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      useAuthStore.getState().setTokens(accessToken, refreshToken);
      router.replace('/dashboard');
    } else {
      router.replace('/auth/login?error=google_failed');
    }
  }, [params, router]);

  return <CallbackLoading />;
}
