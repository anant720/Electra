'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function SignUpPage() {
  const router = useRouter();
  const { isAuthenticated, onboardingComplete } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already logged in — redirect away
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(onboardingComplete ? '/dashboard' : '/onboarding');
    }
  }, [isAuthenticated, onboardingComplete, router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? 'Registration failed. Please try again.');
        return;
      }
      const { accessToken, refreshToken } = await res.json();
      useAuthStore.getState().setTokens(accessToken, refreshToken);
      // New user → always go to onboarding first
      router.replace('/onboarding');
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) return null; // avoid flash

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(160deg, #0B1E2D 0%, #102A43 60%, #0D2137 100%)' }}
    >
      <div className="w-full max-w-md">

        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Brand */}
          <div className="flex flex-col items-center mb-8 gap-3">
            <Image src="/logo.png" alt="ELECTRA logo" width={56} height={56} className="rounded-xl" priority />
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Create your account</h1>
              <p className="text-white/40 text-sm mt-1">Free civic intelligence for every voter</p>
            </div>
          </div>

          {/* Google OAuth */}
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}

            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border text-white text-sm font-semibold transition-all duration-150 hover:bg-white/5 mb-6"
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
            aria-label="Sign up with Google"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4069 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4523 0.347727 11.8269 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.5795C10.3214 3.5795 11.5077 4.0336 12.4405 4.9254L15.0218 2.3441C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5795 9 3.5795Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-white/30 text-xs">or register with email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3 rounded-xl text-sm"
                style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.25)', color: '#FCA5A5' }}
              >
                {error}
              </div>
            )}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Email address
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Password <span style={{ color: 'rgba(255,255,255,0.3)' }}>(min 8 characters)</span>
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white text-sm focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-150 hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #0070F3, #7C3AED)' }}
              aria-live="polite"
            >
              {loading ? 'Creating account…' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: '#60A5FA' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
