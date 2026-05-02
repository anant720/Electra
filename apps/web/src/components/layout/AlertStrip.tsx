'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCivicStore } from '@/store/civicStore';

interface ElectionAlert {
  id: string;
  countryCode: string;
  title: string;
  message: string;
  level: 'info' | 'warning' | 'urgent';
  expiresAt?: string;
}

const LEVEL_STYLES = {
  info:    { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  text: '#6EE7B7', icon: '🟢', label: 'Update' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#FCD34D', icon: '🟡', label: 'Deadline Alert' },
  urgent:  { bg: 'rgba(220,38,38,0.15)',  border: 'rgba(220,38,38,0.4)',  text: '#FCA5A5', icon: '🔴', label: 'Urgent' },
};

// Fallback static alerts when Firestore has no data
const STATIC_ALERTS: Record<string, ElectionAlert[]> = {
  IND: [{ id: 's-ind', countryCode: 'IND', level: 'info',    title: 'Next General Election',   message: 'India\'s next Lok Sabha election is expected in 2029. Verify your EPIC card at voters.eci.gov.in' }],
  USA: [{ id: 's-usa', countryCode: 'USA', level: 'warning', title: 'Midterm Elections 2026',  message: 'US Midterm elections are scheduled for November 2026. Check your registration at vote.gov' }],
  GBR: [{ id: 's-gbr', countryCode: 'GBR', level: 'info',    title: 'Register to Vote',        message: 'Ensure you are registered at gov.uk/register-to-vote before the next election deadline.' }],
  CAN: [{ id: 's-can', countryCode: 'CAN', level: 'info',    title: 'Federal Election Watch',  message: 'Monitor elections.ca for the next federal election announcement and registration deadlines.' }],
  AUS: [{ id: 's-aus', countryCode: 'AUS', level: 'warning', title: 'Enrolment Reminder',     message: 'Voting is compulsory in Australia. Verify your AEC enrolment at aec.gov.au/enrol' }],
};

export function AlertStrip() {
  const pathname = usePathname();
  const { countryCode } = useCivicStore();
  const [alerts, setAlerts]         = useState<ElectionAlert[]>([]);
  const [dismissed, setDismissed]   = useState<Set<string>>(new Set());
  const [current, setCurrent]       = useState(0);

  // Hide on auth + onboarding + emergency pages
  const hideOn = ['/login', '/signup', '/onboarding', '/auth/', '/callback', '/emergency', '/verify'];
  const isHidden = hideOn.some((p) => pathname?.startsWith(p) || pathname === p);

  // Load dismissed IDs from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('electra-dismissed-alerts') ?? '[]');
      setDismissed(new Set(saved));
    } catch { /* ignore */ }
  }, []);

  // Firestore real-time listener
  useEffect(() => {
    if (!countryCode) return undefined;

    // Graceful fallback — use static if Firestore is empty or fails
    const fallback = STATIC_ALERTS[countryCode] ?? [];

    try {
      const q = query(
        collection(db, 'election_alerts'),
        where('countryCode', '==', countryCode),
        where('active', '==', true),
      );

      const unsub = onSnapshot(
        q,
        (snap) => {
          const live = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ElectionAlert));
          setAlerts(live.length > 0 ? live : fallback);
          setCurrent(0);
        },
        () => {
          // Firestore error — use static fallback
          setAlerts(fallback);
        },
      );
      return unsub;
    } catch {
      setAlerts(fallback);
      return undefined;
    }
  }, [countryCode]);

  // Auto-rotate between multiple alerts
  useEffect(() => {
    if (alerts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [alerts]);

  const visible = alerts.filter((a) => !dismissed.has(a.id));
  if (isHidden || !visible.length) return null;

  const alert = visible[current % visible.length];
  if (!alert) return null;

  const style = LEVEL_STYLES[alert.level];

  function dismiss(id: string) {
    const next = new Set(dismissed).add(id);
    setDismissed(next);
    localStorage.setItem('electra-dismissed-alerts', JSON.stringify(Array.from(next)));
    setCurrent(0);
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className="w-full px-4 py-2.5 flex items-center gap-3"
      style={{
        background: style.bg,
        borderBottom: `1px solid ${style.border}`,
      }}
    >
      {/* Icon + label */}
      <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold" style={{ color: style.text }}>
        <span aria-hidden="true">{style.icon}</span>
        <span className="hidden sm:inline uppercase tracking-wider">{style.label}</span>
      </span>

      {/* Divider */}
      <span className="hidden sm:block w-px h-4 flex-shrink-0" style={{ background: style.border }} aria-hidden="true" />

      {/* Message */}
      <p className="flex-1 text-xs font-medium leading-relaxed min-w-0" style={{ color: style.text }}>
        <span className="font-bold">{alert.title}:</span>{' '}
        {alert.message}
      </p>

      {/* Multi-alert dots */}
      {visible.length > 1 && (
        <div className="hidden sm:flex gap-1 flex-shrink-0" aria-hidden="true">
          {visible.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-1.5 h-1.5 rounded-full transition-all duration-200"
              style={{ background: i === current % visible.length ? style.text : style.border }}
              aria-label={`Alert ${i + 1} of ${visible.length}`}
            />
          ))}
        </div>
      )}

      {/* Dismiss */}
      <button
        onClick={() => dismiss(alert.id)}
        className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-150 hover:opacity-70"
        style={{ color: style.text }}
        aria-label="Dismiss this alert"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
