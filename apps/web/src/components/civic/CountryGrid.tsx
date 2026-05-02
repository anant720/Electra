'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCivicStore } from '@/store/civicStore';
import { CountryCode } from '@electra/types';
import { MVP_COUNTRIES, COUNTRY_METADATA } from '@electra/types';

const COUNTRY_DISPLAY: Record<CountryCode, { name: string; flag: string; next?: string }> = {
  IND: { name: 'India', flag: '🇮🇳', next: 'Next election: Verify at eci.gov.in' },
  USA: { name: 'United States', flag: '🇺🇸', next: 'State-specific — verify at vote.gov' },
  GBR: { name: 'United Kingdom', flag: '🇬🇧', next: 'Verify at electoralcommission.org.uk' },
  CAN: { name: 'Canada', flag: '🇨🇦', next: 'Verify at elections.ca' },
  AUS: { name: 'Australia', flag: '🇦🇺', next: 'Verify at aec.gov.au' },
};

export function CountryGrid() {
  const [selected, setSelected] = useState<CountryCode | null>(null);
  const { setCountry } = useCivicStore();
  const router = useRouter();

  const handleSelect = (code: CountryCode) => {
    setSelected(code);
    setCountry(code);
    setTimeout(() => router.push(`/onboarding?country=${code}&step=2`), 300);
  };

  return (
    <div
      role="radiogroup"
      aria-label="Select your country"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
    >
      {MVP_COUNTRIES.map((code) => {
        const country = COUNTRY_DISPLAY[code];
        const isSelected = selected === code;

        return (
          <button
            key={code}
            role="radio"
            aria-checked={isSelected}
            onClick={() => handleSelect(code)}
            className="card-civic flex flex-col items-center gap-3 p-6 text-center cursor-pointer transition-all duration-200"
            style={{
              border: isSelected ? '2px solid var(--color-insight-blue)' : undefined,
              background: isSelected ? 'var(--color-info-bg)' : undefined,
              transform: isSelected ? 'scale(1.02)' : undefined,
            }}
          >
            <span className="text-4xl" aria-hidden="true">{country.flag}</span>
            <span className="text-base font-semibold" style={{ color: 'var(--color-electra-navy)' }}>
              {country.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-slate-gray)' }}>
              {country.next}
            </span>
          </button>
        );
      })}
    </div>
  );
}
