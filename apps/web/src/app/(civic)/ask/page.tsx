'use client';

import { useState } from 'react';
import { useCivicStore } from '@/store/civicStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

type Tab = 'ask' | 'myth';

export default function AskPage() {
  const { countryCode, personaCode } = useCivicStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('ask');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Strict data boundary mapping
  const countryNames: Record<string, string> = {
    IND: 'India', USA: 'United States', GBR: 'United Kingdom', 
    CAN: 'Canada', AUS: 'Australia'
  };
  const activeCountryName = countryCode ? countryNames[countryCode] : 'your country';

  async function handleQuery(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setResponse(null);
    
    // Inject strict context wrappers based on the active tab
    let finalQuery = query;
    if (activeTab === 'myth') {
      finalQuery = `[MYTH VERIFICATION REQUEST] I heard this rumor regarding elections in ${activeCountryName}: "${query}". Is this true or false based strictly on official records?`;
    }

    try {
      const { accessToken } = (await import('@/store/authStore')).useAuthStore.getState();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          query: finalQuery,
          countryCode,
          personaCode,
          language: 'en'
        }),
      });
      
      if (!res.ok) throw new Error('Query failed');
      const data = await res.json();
      setResponse(data);
    } catch {
      setError('Unable to reach ELECTRA AI Engine at the moment.');
    } finally {
      setLoading(false);
    }
  }

  // Determine the Trust Level Badge
  let confidenceBadge = null;
  if (response) {
    if (activeTab === 'myth') {
      // Very basic heuristic for MVP myth checking visuals
      const txt = response.content.toLowerCase();
      if (txt.includes('false') || txt.includes('myth') || txt.includes('not true')) {
        confidenceBadge = <span className="px-3 py-1 text-xs font-black rounded-lg bg-red-100 text-red-700 border border-red-200">🔴 VERIFIED FALSE</span>;
      } else if (txt.includes('true') || txt.includes('fact')) {
        confidenceBadge = <span className="px-3 py-1 text-xs font-black rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">✅ VERIFIED TRUE</span>;
      } else {
        confidenceBadge = <span className="px-3 py-1 text-xs font-black rounded-lg bg-amber-100 text-amber-700 border border-amber-200">⚠️ UNVERIFIED / MIXED</span>;
      }
    } else if (response.confidenceScore && response.confidenceScore < 0.85) {
      confidenceBadge = <span className="px-3 py-1 text-xs font-black rounded-lg bg-amber-100 text-amber-700 border border-amber-200">⚠️ LOW CONFIDENCE - Check official sources</span>;
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-4 py-12" style={{ background: '#F0F4F8' }}>
        <div className="max-w-3xl mx-auto">
          
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="ELECTRA Logo" 
                className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white"
              />
            </div>
            <h1 className="text-4xl font-black text-[#102A43] tracking-tight mb-2">
              ELECTRA Intelligence
            </h1>
            <p className="text-[#52606D] font-medium max-w-lg mx-auto">
              You are securely querying official electoral data strictly for <strong className="text-[#0070F3]">{activeCountryName}</strong>. 
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6 border border-gray-200">
            <button 
              onClick={() => { setActiveTab('ask'); setResponse(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'ask' ? 'bg-[#102A43] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              💬 Ask
            </button>
            <button 
              onClick={() => { setActiveTab('myth'); setResponse(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'myth' ? 'bg-[#102A43] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              🛡️ Myth Check
            </button>
          </div>

          {/* Input Area */}
          <form onSubmit={handleQuery} className="mb-8 relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                activeTab === 'ask' ? `Ask a question about voting in ${activeCountryName}...` :
                `Paste a rumor or claim about elections in ${activeCountryName} to verify it...`
              }
              rows={4}
              className="w-full bg-white rounded-2xl p-5 pr-20 shadow-sm border border-gray-200 resize-none focus:outline-none focus:border-[#0070F3] focus:ring-4 focus:ring-[#0070F3]/10 transition-all text-[#102A43] text-lg font-medium"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-4 bottom-4 p-3 rounded-xl bg-[#0070F3] text-white disabled:opacity-50 hover:bg-[#0051B3] transition-colors shadow-sm"
              aria-label="Submit query"
            >
              {loading ? (
                 <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </form>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-6 font-bold text-sm flex items-center gap-3">
              <span>🔴</span> {error}
            </div>
          )}

          {/* Response Area */}
          {response && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md bg-[#0070F3]/10 text-[#0070F3]">
                    {response.mode?.replace('_', ' ') || 'CIVIC GUIDANCE'}
                  </span>
                  {response.hasLegalCaution && (
                    <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                      LEGAL CAUTION
                    </span>
                  )}
                </div>
                {confidenceBadge}
              </div>
              
              <div className="prose prose-blue max-w-none text-[#102A43] whitespace-pre-wrap font-medium leading-relaxed">
                {response.content}
              </div>

              {/* Verified Sources Block */}
              {response.sources && response.sources.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100 bg-gray-50/50 -mx-6 md:-mx-8 -mb-6 md:-mb-8 p-6 md:p-8 rounded-b-2xl">
                  <h3 className="text-xs font-black text-[#52606D] uppercase tracking-wider mb-3">
                    Verified {activeCountryName} Sources
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {response.sources.map((src: any, idx: number) => (
                      <a key={idx} href={src.url} target="_blank" rel="noopener noreferrer" 
                         className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-[#0070F3] hover:border-[#0070F3] hover:bg-[#0070F3]/5 transition-all shadow-sm">
                        🏛️ {src.name}
                      </a>
                    ))}
                  </div>
                  <div className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {response.disclaimer || 'ELECTRA strictly uses verified state data. It does not generate political opinions.'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
