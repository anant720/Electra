'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import FormRouter from '@/components/FormRouter';
import Link from 'next/link';

export default function CountryRegistrationPage({ params }: { params: { countryCode: string } }) {
  const targetCountry = params.countryCode.toUpperCase();

  const COUNTRY_NAMES: Record<string, string> = {
    IND: 'India',
    USA: 'United States',
    GBR: 'United Kingdom',
    CAN: 'Canada',
    AUS: 'Australia',
  };

  const name = COUNTRY_NAMES[targetCountry];

  if (!name) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[#0B1E2D]">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl text-center max-w-lg">
          <span className="text-4xl block mb-4">🔴</span>
          <h1 className="text-xl font-bold text-red-400 mb-2">Registration Not Available</h1>
          <p className="text-red-400/80 mb-6 text-sm">
            We do not have registration forms for "{targetCountry}" at this time.
          </p>
          <Link href="/dashboard" className="px-6 py-2 bg-red-500/20 text-red-300 rounded-lg font-bold hover:bg-red-500/30">
            Return to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen py-12 px-4" style={{ background: '#F0F4F8' }}>
        <div className="max-w-3xl mx-auto">
          
          <div className="mb-8">
            <Link href={`/country/${targetCountry}`} className="text-[#0070F3] font-bold text-sm hover:underline mb-4 inline-block">
              ← Back to {name} Hub
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-[#102A43] tracking-tight mb-2">
              Registration Portal: {name}
            </h1>
            <p className="text-[#52606D] font-medium">
              Find the exact official form you need to register, update your address, or verify your voter status in {name}.
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            {/* Form Router injected strictly with the target country */}
            <FormRouter countryOverride={targetCountry} />
          </div>

        </div>
      </main>
    </ProtectedRoute>
  );
}
