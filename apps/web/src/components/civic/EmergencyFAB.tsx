'use client';

import Link from 'next/link';
import { useEmergencyStore } from '@/store/emergencyStore';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

export function EmergencyFAB() {
  const { isActive } = useEmergencyStore();

  if (isActive) return null; // Hidden during active emergency (full-screen takes over)

  return (
    <Link
      href="/emergency"
      aria-label="Election day emergency — get help now"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full shadow-xl"
      style={{
        background: 'var(--color-emergency)',
        color: '#FFFFFF',
        padding: '14px 20px',
        minHeight: 56,
        fontWeight: 700,
        fontSize: '0.9375rem',
      }}
    >
      <ExclamationCircleIcon className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">Emergency Help</span>
    </Link>
  );
}
