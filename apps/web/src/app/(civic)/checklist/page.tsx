'use client';

import { useCivicStore } from '@/store/civicStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { getChecklist } from '@/data/checklists';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function ChecklistPage() {
  const { countryCode, personaCode, stateOrProvince, toggleChecklistItem, checklistStates } = useCivicStore();
  const [activeDomain, setActiveDomain] = useState<string>('all');

  const checklist = useMemo(() => {
    return getChecklist(countryCode || 'IND', personaCode || 'P01');
  }, [countryCode, personaCode]);

  const domains = ['all', ...checklist.map(d => d.key)];
  
  const filteredDomains = activeDomain === 'all' 
    ? checklist 
    : checklist.filter(d => d.key === activeDomain);

  const stats = useMemo(() => {
    const allItems = checklist.flatMap(d => d.items);
    const completed = allItems.filter(item => checklistStates[String(item.id)]).length;
    return {
      total: allItems.length,
      completed,
      percent: Math.round((completed / (allItems.length || 1)) * 100)
    };
  }, [checklist, checklistStates]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen pb-20" style={{ background: '#F8FAFC' }}>
        {/* Header */}
        <div className="bg-[#102A43] text-white pt-16 pb-20 px-4 relative overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/dashboard" className="text-white/50 hover:text-white text-sm font-bold transition-colors">
                ← Dashboard
              </Link>
              <span className="text-white/20">•</span>
              <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md bg-white/10 text-white/80">
                Civic Readiness
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Your Voter Checklist
            </h1>
            <p className="text-xl text-white/60 font-medium max-w-2xl">
              Personalized tasks for <strong className="text-white">{countryCode || 'IND'}</strong> 
              {stateOrProvince && <span> • <strong className="text-white">{stateOrProvince}</strong></span>}.
            </p>

            {/* Progress Card */}
            <div className="absolute -bottom-10 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex items-center gap-5">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#F1F5F9" strokeWidth="8" />
                  <circle cx="32" cy="32" r="28" fill="transparent" stroke="#0070F3" strokeWidth="8" 
                    strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * stats.percent / 100)}
                    strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-[#102A43]">
                  {stats.percent}%
                </span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Readiness Score</p>
                <p className="text-lg font-black text-[#102A43]">{stats.completed} of {stats.total} Tasks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-20">
          {/* Domain Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
            {domains.map(d => (
              <button
                key={d}
                onClick={() => setActiveDomain(d)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  activeDomain === d 
                    ? 'bg-[#102A43] text-white shadow-md' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {d === 'all' ? 'All Steps' : d.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          <div className="space-y-12">
            {filteredDomains.map(domain => (
              <section key={domain.key}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shadow-sm">
                    {domain.icon || '🗳️'}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#102A43]">{domain.label}</h2>
                    <p className="text-sm text-gray-500 font-medium">{domain.items.length} Tasks</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {domain.items.map(item => {
                    const itemId = String(item.id);
                    const isCompleted = checklistStates[itemId];
                    return (
                      <div 
                        key={itemId}
                        onClick={() => toggleChecklistItem(itemId)}
                        className={`group flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                          isCompleted 
                            ? 'bg-emerald-50/30 border-emerald-500/20' 
                            : 'bg-white border-transparent hover:border-blue-500/20 shadow-sm'
                        }`}
                      >
                        <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-white border-gray-200 group-hover:border-blue-400'
                        }`}>
                          {isCompleted && <span className="text-[10px] font-black">✓</span>}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-sm transition-all ${
                              isCompleted ? 'text-emerald-900/60 line-through' : 'text-[#102A43]'
                            }`}>
                              {item.label}
                            </h3>
                          </div>
                          <p className={`text-xs leading-relaxed transition-all ${
                            isCompleted ? 'text-emerald-800/40' : 'text-gray-500'
                          }`}>
                            {item.description || 'Verified civic task for your persona.'}
                          </p>
                          
                          {item.actionUrl && !isCompleted && (
                            <div className="mt-4 flex items-center gap-4">
                              <a 
                                href={item.actionUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-black text-[#0070F3] uppercase tracking-widest hover:underline"
                              >
                                Open Portal ↗
                              </a>
                              <Link 
                                href={`/register/${countryCode || 'IND'}`} 
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#102A43] transition-colors"
                              >
                                View Forms
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-20 p-8 rounded-3xl bg-[#102A43] text-white overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black mb-2">Need direct help?</h3>
                <p className="text-white/60 text-sm font-medium">Our AI can guide you through these steps in detail.</p>
              </div>
              <Link href="/ask" className="px-8 py-3 bg-white text-[#102A43] rounded-xl font-black hover:bg-gray-100 transition-colors shadow-lg">
                Ask ELECTRA AI
              </Link>
            </div>
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4 text-9xl">
              💬
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
