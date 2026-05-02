'use client';

import { useState } from 'react';
import { useCivicStore } from '@/store/civicStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function ChecklistPage() {
  const { countryCode, completedRegistrationSteps, toggleRegistrationStep } = useCivicStore();
  const country = countryCode ?? 'IND';
  
  const checklistItems = [
    { id: 0, label: 'Confirm your eligibility to vote', domain: 'Registration' },
    { id: 1, label: 'Complete voter registration form', domain: 'Registration' },
    { id: 2, label: 'Verify your name on the electoral roll', domain: 'Registration' },
    { id: 3, label: 'Locate your Voter ID or required documentation', domain: 'Documents' },
    { id: 4, label: 'Identify alternative documents if ID is lost', domain: 'Documents' },
    { id: 5, label: 'Find your assigned polling station', domain: 'Location' },
    { id: 6, label: 'Save the official voter helpline number', domain: 'Emergency' },
  ];

  const checkedSteps = new Set(completedRegistrationSteps);
  const progress = Math.round((checkedSteps.size / checklistItems.length) * 100);

  return (
    <ProtectedRoute>
      <main className="min-h-screen px-4 py-12" style={{ background: '#F0F4F8' }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0070F3]/10 text-[#0070F3] text-xs font-semibold mb-3">
            My Checklist
          </div>
          <h1 className="text-3xl font-extrabold text-[#102A43] tracking-tight">
            Voter Readiness Checklist
          </h1>
          <p className="text-[#52606D] mt-2">
            Track your preparedness for the upcoming election in {country}.
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[#102A43]">Overall Readiness</span>
            <span className="text-sm font-bold" style={{ color: progress === 100 ? '#16A34A' : '#0070F3' }}>
              {progress}% Ready
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: progress === 100 ? '#16A34A' : '#0070F3' }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {checklistItems.map((item) => {
              const checked = checkedSteps.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleRegistrationStep(item.id)}
                  aria-pressed={checked}
                  className="flex items-center gap-4 w-full p-5 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors"
                    style={{ background: checked ? '#16A34A' : 'transparent', borderColor: checked ? '#16A34A' : '#CBD5E0' }}>
                    {checked && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                        <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-base font-medium ${checked ? 'text-[#52606D] line-through' : 'text-[#102A43]'}`}>
                      {item.label}
                    </p>
                    <p className="text-xs text-[#52606D] mt-1 font-semibold uppercase tracking-wider">
                      {item.domain}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
    </ProtectedRoute>
  );
}
