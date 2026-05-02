'use client';

import { useParams } from 'next/navigation';
import { useCivicStore } from '@/store/civicStore';
import type { CountryCode } from '@electra/types';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const COUNTRY_DETAILS: Record<string, { label: string; url: string; steps: string[] }> = {
  IND: {
    label: 'National Voter Service Portal (India)',
    url: 'https://voters.eci.gov.in',
    steps: [
      'Fill Form 6 for new registration',
      'Upload photo and address proof',
      'Submit and track status with Reference ID'
    ]
  },
  USA: {
    label: 'vote.gov (USA)',
    url: 'https://vote.gov',
    steps: [
      'Select your state',
      'Follow state-specific online registration',
      'Verify deadline (usually 15-30 days before)'
    ]
  },
  GBR: {
    label: 'gov.uk (UK)',
    url: 'https://www.gov.uk/register-to-vote',
    steps: [
      'Need your National Insurance number',
      'Register online in 5 minutes',
      'Ensure you have valid photo ID for polling day'
    ]
  },
  CAN: {
    label: 'elections.ca (Canada)',
    url: 'https://www.elections.ca/enrol',
    steps: [
      'Check if you are already registered',
      'Update your address if you moved',
      'Have your driver\'s license ready'
    ]
  },
  AUS: {
    label: 'aec.gov.au (Australia)',
    url: 'https://www.aec.gov.au/enrol',
    steps: [
      'Enrolment is compulsory for 18+',
      'Use online form with driver\'s license or passport',
      'Check status if you recently moved'
    ]
  }
};

export default function CountryRegisterPage() {
  const params = useParams();
  const countryCode = (params.countryCode as string)?.toUpperCase() || 'IND';
  const details = COUNTRY_DETAILS[countryCode] || COUNTRY_DETAILS.IND;

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-4 py-16 bg-[#F8FAFC]">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h1 className="text-3xl font-black text-[#102A43] mb-2">Register in {countryCode}</h1>
            <p className="text-gray-500 font-medium mb-8">Official registration guide and portal link.</p>

            <div className="space-y-6 mb-10">
              {details.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0070F3] flex items-center justify-center font-black text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-[#102A43] font-bold py-1">{step}</p>
                </div>
              ))}
            </div>

            <a 
              href={details.url} 
              target="_blank" 
              className="block w-full py-4 bg-[#0070F3] text-white text-center rounded-2xl font-black shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
            >
              Open {details.label} ↗
            </a>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
