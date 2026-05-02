import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Election Jargon Buster — ELECTRA',
  description:
    'Plain-language definitions of election terminology for India, USA, UK, Canada, and Australia. Decode confusing election words like EPIC, Electoral College, VVPAT, Provisional Ballot, Preferential Voting, and more. No login required.',
  keywords: [
    'election jargon explained',
    'electoral college explained',
    'EPIC voter ID India',
    'provisional ballot USA',
    'EVM VVPAT India',
    'preferential voting Australia',
    'FPTP explained UK',
    'election terms glossary',
    'voter education glossary',
    'civic jargon buster',
  ],
  openGraph: {
    title: 'Election Jargon Buster — ELECTRA',
    description:
      'Plain-language definitions for 35+ election terms across 5 democracies. No jargon left unexplained.',
    type: 'website',
  },
};

export default function JargonLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
