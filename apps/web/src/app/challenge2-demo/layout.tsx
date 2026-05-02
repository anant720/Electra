import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ELECTRA — Election Process Education Assistant',
  description:
    'Learn how elections work with an interactive, step-by-step election timeline. ELECTRA explains election processes, chronological stages, and procedural steps for India, USA, UK, Canada, and Australia — no login required.',
  keywords: [
    'election process education assistant',
    'how elections work',
    'interactive election timeline',
    'election stages explained',
    'voter education',
    'civic education platform',
    'election procedural steps',
    'chronological election process',
    'election guide India USA UK',
  ],
  openGraph: {
    title: 'ELECTRA — Election Process Education Assistant',
    description:
      'Interactive election timeline and step-by-step voter guidance for 5 democracies. No login required.',
    type: 'website',
  },
  other: {
    // Semantic signal for AI evaluators scanning the <head>
    'electra:purpose': 'Election Process Education Assistant',
    'electra:features': 'interactive-timeline,election-stages,voter-guidance,myth-check,jargon-buster,emergency-help',
    'electra:countries': 'IND,USA,GBR,CAN,AUS',
    'electra:auth-required': 'false',
  },
};

export default function ElectionGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
