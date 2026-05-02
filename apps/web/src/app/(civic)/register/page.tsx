'use client';

import { useState } from 'react';
import { useCivicStore } from '@/store/civicStore';
import type { CountryCode } from '@electra/types';

const COUNTRY_PORTALS: Record<CountryCode, { label: string; url: string; form?: string }> = {
  IND: { label: 'National Voter Service Portal', url: 'https://voters.eci.gov.in', form: 'Form 6' },
  USA: { label: 'vote.gov', url: 'https://vote.gov', form: 'State-specific' },
  GBR: { label: 'gov.uk/register-to-vote', url: 'https://www.gov.uk/register-to-vote' },
  CAN: { label: 'elections.ca', url: 'https://www.elections.ca/enrol' },
  AUS: { label: 'aec.gov.au/enrol', url: 'https://www.aec.gov.au/enrol' },
};

const STEPS: Record<CountryCode, string[]> = {
  IND: [
    'Confirm you are an Indian citizen aged 18+ on the qualifying date.',
    'Go to voters.eci.gov.in and click "New Voter Registration (Form 6)".',
    'Fill in Form 6 with: your name, date of birth, address, and upload a photo.',
    'Submit required documents: Aadhaar or address proof + age proof.',
    'Check status within 30 days. Verify your name is on the roll at nvsp.in.',
  ],
  USA: [
    'Visit vote.gov and select your state — rules vary significantly by state.',
    'Complete the National Mail Voter Registration Form or your state\'s online form.',
    'Ensure you register before your state\'s deadline (typically 15–30 days before election).',
    'Some states allow same-day registration at your polling place.',
    'Check your registration status at your state\'s Secretary of State website.',
  ],
  GBR: [
    'Visit gov.uk/register-to-vote. You need a National Insurance number.',
    'Enter your name, address, and date of birth.',
    'Registration closes 12 working days before an election — register early.',
    'From 2023: you will need accepted photo ID to vote in person. Apply for a free Voter Authority Certificate (VAC) if needed.',
    'Check your registration at gov.uk/contact-electoral-registration-office.',
  ],
  CAN: [
    'Visit elections.ca or call 1-800-463-6868 to register.',
    'Alternatively, you can register at your polling station on Election Day with valid ID.',
    'You need ID showing your name and current address (e.g. driver\'s licence).',
    'If you moved, update your address at elections.ca.',
    'Check your registration status by calling 1-800-463-6868.',
  ],
  AUS: [
    'Visit aec.gov.au/enrol to enrol online.',
    'You need: Australian citizenship, to be 18+ (or 16+ to enrol for voting at 18).',
    'The roll closes at 8pm on the day the writ is issued for an election.',
    'Voting is compulsory for enrolled citizens 18+ — failure to vote may result in a fine.',
    'Check your enrolment status at aec.gov.au.',
  ],
};

export default function RegisterPage() {
  const { countryCode, completedRegistrationSteps, toggleRegistrationStep } = useCivicStore();
  const country = (countryCode ?? 'IND') as CountryCode;
  const portal = COUNTRY_PORTALS[country];
  const steps = STEPS[country];

  // Derive checked steps set for fast lookup
  const checkedSteps = new Set(completedRegistrationSteps);

  const progress = Math.round((checkedSteps.size / steps.length) * 100);

  return (
    <main className="min-h-screen px-4 py-12" style={{ background: '#F0F4F8' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070F3]/10 text-[#0070F3] text-xs font-semibold mb-3">
            Registration Guide
          </div>
          <h1 className="text-3xl font-extrabold text-[#102A43] tracking-tight">
            How to Register to Vote
          </h1>
          <p className="text-[#52606D] mt-2">
            Official, verified steps for {country} — sourced from {portal.label}.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#102A43]">Your Progress</span>
            <span className="text-sm font-bold text-[#0070F3]">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: progress === 100 ? '#16A34A' : '#0070F3' }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-8">
          {steps.map((step, i) => {
            const checked = checkedSteps.has(i);
            return (
              <button
                key={i}
                onClick={() => toggleRegistrationStep(i)}
                aria-pressed={checked}
                className="flex items-start gap-4 w-full p-4 rounded-xl bg-white border text-left transition-all"
                style={{ borderColor: checked ? '#16A34A' : '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
              >
                <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                  style={{ background: checked ? '#16A34A' : 'transparent', borderColor: checked ? '#16A34A' : '#CBD5E0' }}>
                  {checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-[#52606D] uppercase tracking-wider">Step {i + 1}</span>
                  <p className={`text-sm mt-0.5 leading-relaxed ${checked ? 'text-[#52606D] line-through' : 'text-[#102A43]'}`}>{step}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Official portal CTA */}
        <div className="bg-[#102A43] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold text-sm">Official Registration Portal</p>
            <p className="text-white/60 text-xs mt-0.5">{portal.label}</p>
          </div>
          <a
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: '#0070F3', color: '#fff' }}
          >
            Register Now →
          </a>
        </div>

        <p className="text-[#52606D] text-xs text-center mt-6">
          ELECTRA provides civic guidance, not legal advice. Verify at the official portal before acting.
        </p>
      </div>
    </main>
  );
}
