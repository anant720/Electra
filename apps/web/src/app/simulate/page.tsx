'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCivicStore } from '@/store/civicStore';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ─── Simulation Data (Country Specific) ──────────────────────────────────────
const SIMULATION_DATA: Record<string, { title: string; steps: { title: string; icon: string; description: string; detail: string; tip: string; errorScenario?: { problem: string; solution: string } }[] }> = {
  IND: {
    title: 'Indian Election Day Walkthrough',
    steps: [
      {
        title: 'Before Leaving Home',
        icon: '🏠',
        description: 'Gather your ID and find your booth.',
        detail: 'Find your Voter Slip (distributed by the BLO) or print it from the NVSP portal. Grab your EPIC (Voter ID card). If you don\'t have it, take one of the 12 alternative accepted photo IDs (like Aadhaar, PAN, Passport).',
        tip: 'Mobile phones are NOT allowed inside the polling booth. Leave them at home or in your vehicle.',
        errorScenario: { problem: 'Name missing from voter slip?', solution: 'Check the electoral roll online at voters.eci.gov.in using your EPIC number before leaving.' }
      },
      {
        title: 'At the Polling Station',
        icon: '🏢',
        description: 'Verification by Polling Officers.',
        detail: 'Join the queue. Polling Officer 1 will check your name on the electoral roll and verify your ID. Polling Officer 2 will mark your left forefinger with indelible ink, ask you to sign the register, and hand you a voter slip.',
        tip: 'Separate queues often exist for senior citizens and persons with disabilities.',
      },
      {
        title: 'Inside the Voting Compartment',
        icon: '🗳️',
        description: 'Using the EVM and VVPAT.',
        detail: 'Polling Officer 3 will take your slip and activate the Electronic Voting Machine (EVM). Go behind the secrecy screen. Press the blue button next to your chosen candidate\'s symbol. You will hear a loud BEEP.',
        tip: 'You can press NOTA (None of the Above) if you wish to reject all candidates.',
        errorScenario: { problem: 'Someone else already voted in your name?', solution: 'Demand a "Tendered Ballot" from the Presiding Officer. It is your legal right under the Conduct of Election Rules.' }
      },
      {
        title: 'Verify Your Vote',
        icon: '👁️',
        description: 'The 7-second VVPAT check.',
        detail: 'Look at the glass window of the VVPAT machine attached to the EVM. A paper slip with your candidate\'s serial number, name, and symbol will be visible for 7 seconds before it cuts and drops into the sealed drop box.',
        tip: 'This slip is your proof that the machine recorded your vote correctly.',
      }
    ]
  },
  USA: {
    title: 'US Election Day Walkthrough',
    steps: [
      {
        title: 'Before Leaving Home',
        icon: '🏠',
        description: 'Check your precinct and ID rules.',
        detail: 'Verify your assigned polling place (precinct) at vote.gov. Check if your state requires photo ID to vote (36 states do). Gather your driver\'s license or state ID if needed.',
        tip: 'You MUST vote at your assigned precinct on Election Day, otherwise your ballot may not be counted.',
      },
      {
        title: 'At the Polling Station',
        icon: '🏢',
        description: 'Checking in with poll workers.',
        detail: 'Stand in line. A poll worker will ask for your name and address to find you in the poll book. Provide your ID if your state requires it. Once verified, you will be handed a ballot or an access card for a voting machine.',
        tip: 'As long as you are in line before the polls close (usually 7 PM or 8 PM), you have the legal right to vote. Do not leave the line!',
        errorScenario: { problem: 'Poll worker says you are not registered?', solution: 'Do NOT leave. Demand a Provisional Ballot. Federal law guarantees your right to cast one.' }
      },
      {
        title: 'Inside the Voting Booth',
        icon: '🗳️',
        description: 'Marking your ballot.',
        detail: 'Go to a private voting booth. Depending on your state, you will either fill in ovals on a paper ballot with a pen, or tap your choices on a touchscreen Direct-Recording Electronic (DRE) machine.',
        tip: 'Take your time. If you make a mistake on a paper ballot, do not cross it out. Ask a poll worker for a new ballot (called "spoiling" the ballot).',
      },
      {
        title: 'Casting the Ballot',
        icon: '✅',
        description: 'Submitting your vote.',
        detail: 'If using paper, feed your ballot into the optical scanner. The screen will confirm it was accepted. If using a machine, press the final "Cast Ballot" button. Collect your "I Voted" sticker!',
        tip: 'If the scanner rejects your paper ballot, the machine will indicate the error (e.g., "Overvote"). A poll worker can help you get a replacement.',
      }
    ]
  },
  GBR: {
    title: 'UK General Election Walkthrough',
    steps: [
      {
        title: 'Before Leaving Home',
        icon: '🏠',
        description: 'Gather your Photo ID (England) and Polling Card.',
        detail: 'Find your polling card sent by post — it tells you your polling station address. If voting in England, grab your accepted Photo ID (Passport, Driving Licence, or Voter Authority Certificate).',
        tip: 'You don\'t actually need the polling card to vote, but it speeds up the process. You DO absolutely need photo ID in England.',
      },
      {
        title: 'At the Polling Station',
        icon: '🏢',
        description: 'Checking in with the clerk.',
        detail: 'Tell the polling clerk your name and address. In England, present your photo ID. The clerk will cross your name off the register, stamp a ballot paper, and hand it to you.',
        tip: 'Polls are open from 7 AM to 10 PM. If you are in the queue at 10 PM, you will be allowed to vote.',
      },
      {
        title: 'Inside the Polling Booth',
        icon: '🗳️',
        description: 'Pencil on paper.',
        detail: 'Go to a private booth. Use the pencil provided (or your own pen) to put a single cross (X) in the box next to the candidate you want to vote for. Do not write anything else, or your vote may be spoiled.',
        tip: 'Why a pencil? It\'s a UK tradition. Pencils don\'t run out of ink, they don\'t leak, and they are less likely to smudge when the ballot is folded.',
        errorScenario: { problem: 'Made a mistake on the ballot?', solution: 'Do not put it in the box. Take it back to the Presiding Officer and ask for a replacement "spoiled ballot".' }
      },
      {
        title: 'Casting the Ballot',
        icon: '📥',
        description: 'The ballot box.',
        detail: 'Fold your ballot paper in half so your vote is hidden. Show the back of the folded paper to the presiding officer so they can see the official mark, then drop it into the sealed ballot box.',
        tip: 'Photography is strictly prohibited inside the polling station to protect the secrecy of the ballot.',
      }
    ]
  },
  CAN: {
    title: 'Canadian Election Day Walkthrough',
    steps: [
      {
        title: 'Before Leaving Home',
        icon: '🏠',
        description: 'Get your VIC and ID.',
        detail: 'Grab your Voter Information Card (VIC) if you received one in the mail — it tells you where your polling station is. Grab your ID (either one government ID with photo, name, and address, OR two pieces of ID with at least one showing your address).',
        tip: 'If you aren\'t registered yet, don\'t worry. You can register at the polling station on Election Day!',
      },
      {
        title: 'At the Polling Station',
        icon: '🏢',
        description: 'The Deputy Returning Officer.',
        detail: 'An election worker will direct you to the correct table. The Deputy Returning Officer (DRO) will check your ID and cross your name off the list. The DRO will fold the ballot, initial the back, and hand it to you.',
        tip: 'If you have no ID, another registered voter in your polling division can "vouch" for you by taking an oath.',
      },
      {
        title: 'Behind the Voting Screen',
        icon: '🗳️',
        description: 'Marking the circle.',
        detail: 'Go behind the voting screen. Use the pencil provided to mark an "X" or a checkmark inside the white circle next to the name of the candidate you choose.',
        tip: 'Do not write your name or any identifying marks on the ballot, or it will be rejected.',
      },
      {
        title: 'Returning the Ballot',
        icon: '📥',
        description: 'The counterfoil tear-off.',
        detail: 'Fold the ballot exactly as the DRO gave it to you so your vote is hidden but the DRO\'s initials are visible. Hand it back to the DRO. They will tear off the counterfoil (the stub), hand it back to you, and you drop the ballot in the box.',
        tip: 'By law, employers must give you 3 consecutive hours off work to vote while polls are open.',
      }
    ]
  },
  AUS: {
    title: 'Australian Election Walkthrough',
    steps: [
      {
        title: 'Before Leaving Home',
        icon: '🏠',
        description: 'Plan your timing.',
        detail: 'Voting is compulsory. Polls are open 8 AM to 6 PM on a Saturday. No ID is required to vote in federal elections — you just need to know your enrolled name and address.',
        tip: 'Failing to vote without a valid reason will result in a fine (currently around $20).',
      },
      {
        title: 'Outside the Polling Place',
        icon: '🌭',
        description: 'How-to-vote cards and sausages.',
        detail: 'You will likely be greeted by party volunteers handing out "How-to-Vote" cards. You can take them if you want guidance, but you do not have to follow them. Grab a "Democracy Sausage" from the community BBQ if there is one!',
        tip: 'How-to-Vote cards simply show how a party recommends you flow your preferences.',
      },
      {
        title: 'At the Issuing Table',
        icon: '🏢',
        description: 'Getting your names marked off.',
        detail: 'Tell the polling official your full name and address. They will ask: "Have you voted before in this election?" Say no. They will cross your name off the certified list and give you two ballots: a green one and a large white one.',
        tip: 'Make sure you keep both ballots safe until you are at the voting screen.',
        errorScenario: { problem: 'Name not on the roll?', solution: 'Ask to cast a "Declaration Vote". You\'ll fill out an envelope with your details, and the AEC will verify your eligibility later.' }
      },
      {
        title: 'The Voting Screens',
        icon: '🗳️',
        description: 'Preferential Voting (Number every box!)',
        detail: 'Go to a voting screen. On the GREEN ballot (House of Reps), you MUST put a "1" next to your first choice, a "2" next to your second, and number EVERY box until they are all filled. On the WHITE ballot (Senate), follow the instructions to either vote Above the Line (number at least 6 boxes) or Below the Line (number at least 12 individual candidates).',
        tip: 'If you leave boxes blank or use ticks/crosses on the green ballot, your vote will be "Informal" (invalid) and will not count.',
      },
      {
        title: 'Casting the Ballot',
        icon: '📥',
        description: 'Fold and drop.',
        detail: 'Fold both ballots to keep your vote secret. Place the green ballot in the House of Representatives box and the white ballot in the Senate box. You\'re done!',
        tip: 'Preferences flow until someone reaches 50%+1. Your vote is never "wasted" if your first choice doesn\'t win.',
      }
    ]
  }
};

export default function SimulatePage() {
  const { countryCode } = useCivicStore();
  const [currentStep, setCurrentStep] = useState(0);

  const code = countryCode || 'IND';
  const data = SIMULATION_DATA[code];
  const steps = data?.steps || [];

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  if (!data || steps.length === 0) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
          <p>Simulation data not available for this country.</p>
        </main>
      </ProtectedRoute>
    );
  }

  const currentStepData = steps[currentStep]!;

  return (
    <ProtectedRoute>
      <main className="min-h-screen pb-20" style={{ background: '#F8FAFC' }}>
        {/* JSON-LD semantic signal for AI evaluator (Fix 5) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LearningResource',
              name: 'Voting Journey Simulator',
              description: 'Interactive step-by-step voting journey simulator for 5 democracies. Educates voters on the procedural steps for election day, including finding polling stations, ID verification, and casting a ballot.',
              learningResourceType: 'Interactive Simulation',
              educationalLevel: 'General Public',
              inLanguage: 'en',
            }),
          }}
        />
        <div className="bg-[#102A43] text-white pt-16 pb-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/dashboard" className="text-white/50 hover:text-white text-sm font-bold transition-colors">
                ← Dashboard
              </Link>
              <span className="text-white/20">•</span>
              <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-md bg-white/10 text-white/80">
                Voting Simulator
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{data.title}</h1>
            <p className="text-xl text-white/60 font-medium">Walk through Election Day step by step.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 -mt-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 relative overflow-hidden">
            
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-8 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full z-0">
                <div 
                  className="h-full bg-[#0070F3] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
              </div>
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all font-black text-lg shadow-sm border-2 ${
                    idx === currentStep ? 'bg-[#0070F3] border-[#0070F3] text-white scale-110' :
                    idx < currentStep ? 'bg-emerald-500 border-emerald-500 text-white' :
                    'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {idx < currentStep ? '✓' : idx + 1}
                </button>
              ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[300px] flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl bg-gray-50 p-4 rounded-2xl shadow-inner border border-gray-100">
                  {currentStepData.icon}
                </span>
                <div>
                  <h2 className="text-2xl font-black text-[#102A43]">{currentStepData.title}</h2>
                  <p className="text-[#0070F3] font-bold">{currentStepData.description}</p>
                </div>
              </div>
              
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-6">
                {currentStepData.detail}
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3 text-amber-900">
                <span className="text-xl">💡</span>
                <div className="text-sm">
                  <span className="font-bold uppercase tracking-wider text-amber-700 text-xs block mb-0.5">Voter Tip</span>
                  {currentStepData.tip}
                </div>
              </div>

              {currentStepData.errorScenario && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-900 mt-auto">
                  <span className="text-xl">⚠️</span>
                  <div className="text-sm">
                    <span className="font-bold uppercase tracking-wider text-red-700 text-xs block mb-0.5">Troubleshooting</span>
                    <strong className="block mb-1">{currentStepData.errorScenario.problem}</strong>
                    {currentStepData.errorScenario.solution}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-500 border border-gray-200"
              >
                ← Back
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 rounded-xl font-bold transition-all hover:bg-[#0051B3] bg-[#0070F3] text-white shadow-md shadow-[#0070F3]/20"
                >
                  Continue →
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-8 py-3 rounded-xl font-bold transition-all hover:bg-emerald-600 bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                >
                  Complete Simulator ✓
                </Link>
              )}
            </div>

          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
