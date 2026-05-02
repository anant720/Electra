'use client';

import { useCivicStore } from '@/store/civicStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ElectionsPage() {
  const { countryCode } = useCivicStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchElections() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/countries/${countryCode || 'IND'}`);
        const data = await res.json();
        setEvents(data.jurisdictions?.[0]?.electionEvents || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchElections();
  }, [countryCode]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen pb-20" style={{ background: '#F8FAFC' }}>
        <div className="bg-[#102A43] text-white pt-16 pb-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/dashboard" className="text-white/50 hover:text-white text-sm font-bold transition-colors">
                ← Dashboard
              </Link>
              <span className="text-white/20">•</span>
              <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md bg-white/10 text-white/80">
                Election Calendar
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Global Election Timelines</h1>
            <p className="text-xl text-white/60 font-medium">Tracking verified democratic cycles for {countryCode}.</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-4 border-navy/10 border-t-[#0070F3] animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {events.length > 0 ? events.map((event, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-8 group hover:border-[#0070F3]/30 transition-all">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 group-hover:bg-[#0070F3]/5 transition-colors">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                      {new Date(event.electionDate).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-3xl font-black text-[#102A43]">
                      {new Date(event.electionDate).getDate()}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 mt-1">
                      {new Date(event.electionDate).getFullYear()}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-[#0070F3]/10 text-[#0070F3]">
                        {event.type}
                      </span>
                      {event.isActive && (
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-700">
                          Active Cycle
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-[#102A43] mb-2">{event.name}</h2>
                    <p className="text-gray-500 font-medium leading-relaxed max-w-xl">
                      {event.description || 'Verified electoral event tracked by ELECTRA sovereign intelligence.'}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <Link 
                      href={`/register/${countryCode}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#102A43] text-white rounded-xl font-bold hover:bg-[#0D2137] transition-colors shadow-md"
                    >
                      Registration Info
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
                  <span className="text-5xl block mb-6">📅</span>
                  <h2 className="text-xl font-black text-[#102A43] mb-2">No Upcoming Elections</h2>
                  <p className="text-gray-500 font-medium">We are currently verifying the next democratic cycle for this jurisdiction.</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 p-8 rounded-3xl border-2 border-dashed border-gray-200 text-center">
            <h3 className="text-lg font-black text-[#52606D] mb-2">Missing an election?</h3>
            <p className="text-gray-400 text-sm font-medium mb-6">Our governance team updates global timelines weekly.</p>
            <Link href="/ask" className="text-[#0070F3] font-black text-sm uppercase tracking-widest hover:underline">
              Request Verification ↗
            </Link>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
