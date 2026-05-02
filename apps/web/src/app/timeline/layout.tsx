import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Interactive Election Timeline — ELECTRA',
  description:
    'Explore the full chronological election timeline for India, USA, UK, Canada, and Australia. Click any stage to understand what happens, when, and exactly what you need to do. No login required.',
  keywords: [
    'election timeline',
    'how elections work step by step',
    'election process stages',
    'India election process',
    'USA election timeline',
    'UK election process',
    'Canada election stages',
    'Australia election how to vote',
    'chronological election steps',
    'interactive election guide',
  ],
  openGraph: {
    title: 'Interactive Election Timeline — ELECTRA',
    description:
      'Step-by-step election timeline for 5 democracies. Click any stage to see plain-language explanations and exactly what you need to do.',
    type: 'website',
  },
};

export default function TimelineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
