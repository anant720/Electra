'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Basic list of verified TLDs and specific domains for the 5 MVP countries
const VERIFIED_DOMAINS = [
  '.gov', '.mil', '.edu', 
  'voters.eci.gov.in', 'eci.gov.in',
  'vote.gov', 'fvap.gov',
  'gov.uk', 'electoralcommission.org.uk',
  'elections.ca',
  'aec.gov.au'
];

type VerificationState = 'idle' | 'loading' | 'safe' | 'unsafe' | 'invalid';

export default function VerifyPage() {
  const router = useRouter();
  const [inputUrl, setInputUrl] = useState('');
  const [status, setStatus] = useState<VerificationState>('idle');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    setStatus('loading');

    setTimeout(() => {
      try {
        // Simple heuristic to add https if missing so URL parser works
        const formattedUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
        const parsed = new URL(formattedUrl);
        const hostname = parsed.hostname.toLowerCase();

        const isSafe = VERIFIED_DOMAINS.some(domain => 
          hostname === domain || hostname.endsWith(`.${domain}`)
        );

        setStatus(isSafe ? 'safe' : 'unsafe');
      } catch {
        setStatus('invalid');
      }
    }, 1500); // Simulate network latency for DB check
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0B1E2D' }}>
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #10B981, #047857)' }}>
              <span className="text-3xl">🛡️</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Link Verifier</h1>
            <p className="text-white/60 mt-2 text-sm leading-relaxed">
              Don't get tricked by phishing scams. Paste any election-related link or SMS URL below, and ELECTRA will check it against our Official Source Registry.
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleVerify} className="relative mb-8">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setStatus('idle');
              }}
              placeholder="e.g., https://voters.eci.gov.in"
              className="w-full px-5 py-4 pr-32 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading' || !inputUrl.trim()}
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              {status === 'loading' ? 'Checking...' : 'Verify'}
            </button>
          </form>

          {/* Status Display */}
          {status === 'safe' && (
            <div className="p-6 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/10 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-4xl block mb-2">✅</span>
              <h2 className="text-emerald-400 font-bold text-lg mb-1">Official Government Link</h2>
              <p className="text-emerald-400/80 text-sm">
                This link belongs to a verified electoral authority. It is safe to click and enter your personal information.
              </p>
            </div>
          )}

          {status === 'unsafe' && (
            <div className="p-6 rounded-2xl border-2 border-red-500/30 bg-red-500/10 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-4xl block mb-2">🔴</span>
              <h2 className="text-red-400 font-bold text-lg mb-1">Unverified Link Warning</h2>
              <p className="text-red-400/80 text-sm mb-4">
                This domain is NOT in our Official Source Registry. It may be a phishing attempt or misinformation. Do not enter personal details.
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 text-xs font-bold hover:bg-red-500/30 transition-colors"
              >
                Scan another link
              </button>
            </div>
          )}

          {status === 'invalid' && (
            <div className="text-center p-4">
              <p className="text-amber-400 text-sm font-medium">Please enter a valid URL (e.g., vote.gov)</p>
            </div>
          )}

          {/* Navigation Back */}
          <div className="mt-12 text-center">
            <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors text-sm font-medium">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
