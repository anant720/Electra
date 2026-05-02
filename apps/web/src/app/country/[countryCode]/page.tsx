'use client';

import { useCivicStore } from '@/store/civicStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CountryIntelligencePage({ params }: { params: { countryCode: string } }) {
  const router = useRouter();
  const { countryCode: userCountry } = useCivicStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Route params extraction
  const targetCountry = params.countryCode.toUpperCase();

  useEffect(() => {
    async function fetchCountryData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/countries/${targetCountry}`);
        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCountryData();
  }, [targetCountry]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0B1E2D]">
        <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-[#0070F3] animate-spin" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-[#0B1E2D]">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl text-center max-w-lg">
          <span className="text-4xl block mb-4">🔴</span>
          <h1 className="text-xl font-bold text-red-400 mb-2">Jurisdiction Not Found</h1>
          <p className="text-red-400/80 mb-6 text-sm">
            The jurisdiction code "{targetCountry}" is not currently supported by ELECTRA MVP.
          </p>
          <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-red-500/20 text-red-300 rounded-lg font-bold hover:bg-red-500/30">
            Return to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const isHomeCountry = userCountry === targetCountry;
  const events = data.jurisdictions?.[0]?.electionEvents || [];
  const myths = data.civicAxioms?.filter((a: any) => a.category === 'MYTH') || [];

  return (
    <ProtectedRoute>
      <main className="min-h-screen pb-20" style={{ background: '#F0F4F8' }}>
        {/* Banner */}
        <div className="bg-[#102A43] text-white pt-16 pb-12 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none text-[20rem] leading-none transform translate-x-1/4 -translate-y-1/4">
            {data.flagEmoji}
          </div>
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/dashboard" className="text-white/50 hover:text-white text-sm font-bold transition-colors">
                ← Dashboard
              </Link>
              <span className="text-white/20">•</span>
              <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md bg-white/10 text-white/80">
                Country Intelligence Hub
              </span>
              {isHomeCountry && (
                <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  YOUR REGISTERED REGION
                </span>
              )}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2 flex items-center gap-4">
              <span>{data.flagEmoji}</span> {data.name}
            </h1>
            <p className="text-xl text-white/60 font-medium">
              Governed by the {data.authorityName} ({data.authorityAbbr})
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column (Main Specs) */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-sm font-black text-[#52606D] uppercase tracking-widest mb-6">Electoral Framework</h2>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Voting System</p>
                    <p className="text-[#102A43] font-bold text-lg">{data.electoralSystemLower}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Voting Age</p>
                    <p className="text-[#102A43] font-bold text-lg">{data.votingAge} Years</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Compulsory Voting</p>
                    <p className="text-[#102A43] font-bold text-lg">{data.compulsoryVoting ? 'Yes — Fines Apply' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Official Portal</p>
                    <a href={data.authorityPortal} target="_blank" className="text-[#0070F3] font-bold text-lg hover:underline truncate block">
                      {data.authorityPortal.replace('https://', '')} ↗
                    </a>
                  </div>
                </div>
              </div>

              {myths.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-black text-[#52606D] uppercase tracking-widest mb-6">Top MythBusters</h2>
                  <div className="space-y-4">
                    {myths.slice(0, 8).map((myth: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="font-black text-[#102A43] mb-2 text-sm">🤔 {myth.fact}</p>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                          <span className="text-emerald-600 font-black">FACT:</span> {myth.plainFact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-t-4 border-t-[#0070F3]">
                <h2 className="text-xs font-black text-[#52606D] uppercase tracking-widest mb-2">Next Election Event</h2>
                <p className="text-2xl font-black text-[#102A43] leading-tight mb-4">
                  {events[0]?.name || 'No Upcoming Events'}
                </p>
                
                <div className="space-y-3">
                  {events.map((event: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-bold text-gray-600">
                        {new Date(event.electionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700`}>
                        {event.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link 
                href={`/register/${targetCountry}`}
                className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-[#0070F3] to-[#7C3AED] text-white shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div>
                  <h3 className="font-black text-lg mb-1">Civic Forms</h3>
                  <p className="text-white/80 text-xs font-bold">View {data.name} Registration Forms</p>
                </div>
                <span className="text-2xl">📝</span>
              </Link>
            </div>

          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
