'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCivicStore } from '@/store/civicStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

type ScenarioID = 'T01' | 'T02' | 'T04';

export default function EmergencyPage() {
  const router = useRouter();
  const { countryCode } = useCivicStore();
  const [scenario, setScenario] = useState<ScenarioID | null>(null);
  const [cache, setCache] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    fetch('/data/emergency_cache.json')
      .then(res => res.json())
      .then(data => setCache(data.countries))
      .catch(console.error);
  }, []);

  // ProtectedRoute ensures the user is logged in, and onboarding ensures countryCode is set.
  // If for some reason countryCode is missing, fallback gracefully or let ProtectedRoute handle it.
  const activeCountry = countryCode && cache && cache[countryCode] ? countryCode : 'IND';
  const data = cache ? cache[activeCountry] : null;

  if (!cache) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{ backgroundColor: '#1A0000', color: '#FFFFFF' }}>
        <div className="animate-pulse font-bold tracking-widest text-red-500">LOADING EMERGENCY PROTOCOLS...</div>
      </main>
    );
  }

  // --- Step 2: Display Steps if Scenario Selected ---
  if (scenario && data) {
    const scenarioData = data.scenarios[scenario];
    
    return (
      <ProtectedRoute>
        <main className="min-h-screen flex flex-col p-4 sm:p-8" style={{ backgroundColor: '#1A0000', color: '#FFFFFF' }}>
          <div className="max-w-2xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setScenario(null)}
                className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <span className="px-3 py-1 rounded-full text-xs font-black tracking-widest" style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}>
                ELECTION DAY
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black mb-8 leading-tight tracking-tight uppercase">
              {scenarioData.title}
            </h1>

            <p className="text-red-400 font-bold mb-4 uppercase tracking-widest text-sm">Do this right now:</p>

            {/* Steps */}
            <div className="space-y-4 mb-10">
              {scenarioData.steps.map((step: string, i: number) => (
                <div 
                  key={i} 
                  className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl border"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-black text-lg" style={{ backgroundColor: '#FFFFFF', color: '#1A0000' }}>
                    {i + 1}
                  </span>
                  <p className="text-lg sm:text-xl font-medium leading-snug">{step}</p>
                </div>
              ))}
            </div>

            {/* Helpline Footer */}
            <a
              href={`tel:${data.helpline}`}
              className="flex flex-col items-center justify-center w-full p-6 rounded-2xl font-black text-center transition-transform hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: '#FFFFFF', color: '#1A0000' }}
            >
              <span className="text-2xl sm:text-3xl mb-1">📞 {data.helpline}</span>
              <span className="text-sm font-bold opacity-70">CALL NATIONAL VOTER HELPLINE • FREE 24/7</span>
            </a>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  // --- Step 3: Default Scenario Selector ---
  return (
    <ProtectedRoute>
      <main className="min-h-screen flex flex-col p-4 sm:p-8" style={{ backgroundColor: '#1A0000', color: '#FFFFFF' }}>
        <div className="max-w-2xl mx-auto w-full">
          {/* Minimal Header */}
          <div className="flex items-center justify-between mb-12">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              ✕ Exit Emergency
            </button>
            <span className="flex items-center gap-2 text-sm font-black tracking-widest text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              EMERGENCY HELP
            </span>
          </div>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-black tracking-widest mb-4" style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}>
              {activeCountry} ELECTION
            </span>
            <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight">
              What's happening?
            </h1>
          </div>

          {/* Scenarios */}
          <div className="space-y-4 mb-12">
            {Object.entries(data?.scenarios || {}).map(([id, s]: [string, any]) => (
              <button
                key={id}
                onClick={() => setScenario(id as ScenarioID)}
                className="w-full flex items-center justify-between p-6 sm:p-8 rounded-2xl border-2 text-left transition-all hover:bg-white/5 active:scale-[0.98]"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              >
                <span className="text-xl sm:text-2xl font-bold">{s.title}</span>
                <span className="text-white/50 text-2xl">→</span>
              </button>
            ))}
            <button
              onClick={() => window.location.href = `tel:${data?.helpline}`}
              className="w-full flex items-center justify-between p-6 sm:p-8 rounded-2xl border-2 text-left transition-all hover:bg-white/5 active:scale-[0.98]"
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}
            >
              <span className="text-xl sm:text-2xl font-bold">Something else (Call Helpline)</span>
              <span className="text-white/50 text-2xl">→</span>
            </button>
          </div>

          {/* Helpline Footer */}
          <div className="text-center">
            <p className="text-white/50 text-sm font-bold tracking-widest uppercase mb-3">Official Helpline</p>
            <a
              href={`tel:${data?.helpline}`}
              className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-xl font-black text-2xl"
              style={{ backgroundColor: '#FFFFFF', color: '#1A0000' }}
            >
              📞 {data?.helpline}
            </a>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
