'use client';

import { useCivicStore } from '@/store/civicStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function RegisterRedirect() {
  const { countryCode } = useCivicStore();
  const router = useRouter();

  useEffect(() => {
    if (countryCode) {
      router.replace(`/register/${countryCode}`);
    } else {
      router.replace('/onboarding');
    }
  }, [countryCode, router]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen flex items-center justify-center bg-[#0B1E2D]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-[#0070F3] animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-medium">Routing to your jurisdiction registration portal...</p>
        </div>
      </main>
    </ProtectedRoute>
  );
}
