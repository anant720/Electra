import type { CountryCode, PersonaCode } from '@electra/types';


export interface ChecklistItem {
  id: number;
  label: string;
  description?: string;
  actionUrl?: string;
}


export interface ChecklistDomain {
  key: string;
  label: string;
  icon: string;
  weight: number;
  items: ChecklistItem[];
  dependsOn: string | null;
}

const DEFAULT_CHECKLIST: ChecklistDomain[] = [
  {
    key: 'eligibility', label: 'Eligibility', icon: '✅', weight: 20,
    dependsOn: null,
    items: [
      { id: 0, label: 'Age verified (18+)' },
      { id: 1, label: 'Citizenship confirmed' },
      { id: 2, label: 'Residency confirmed' }
    ]
  },
  {
    key: 'registration', label: 'Registration', icon: '📋', weight: 25,
    dependsOn: 'eligibility',
    items: [
      { id: 3, label: 'Registered to vote' },
      { id: 4, label: 'Name correct on roll' },
      { id: 5, label: 'Address current' }
    ]
  },
  {
    key: 'documents', label: 'Documents', icon: '🪪', weight: 20,
    dependsOn: 'registration',
    items: [
      { id: 6, label: 'Photo ID ready' },
      { id: 7, label: 'Secondary ID (if required)' }
    ]
  },
  {
    key: 'deadlines', label: 'Deadlines', icon: '📅', weight: 20,
    dependsOn: 'registration',
    items: [
      { id: 8, label: 'Registration deadline noted' },
      { id: 9, label: 'Mail-in/postal deadline noted' }
    ]
  },
  {
    key: 'location', label: 'Location', icon: '📍', weight: 15,
    dependsOn: 'deadlines',
    items: [
      { id: 10, label: 'Polling station found' },
      { id: 11, label: 'Route planned' },
      { id: 12, label: 'Opening hours noted' }
    ]
  }
];

export const CHECKLISTS_BY_COUNTRY: Record<CountryCode, Record<PersonaCode, ChecklistDomain[]>> = {
  IND: {
    P01: [ // First-time voter
      {
        key: 'registration', label: 'Registration', icon: '📋', weight: 40,
        dependsOn: null,
        items: [
          { id: 0, label: 'Submitted Form 6 (NVSP/Voters App)' },
          { id: 1, label: 'Voter Reference Number (VRN) tracked' },
          { id: 2, label: 'Name verified in Electoral Roll' },
          { id: 3, label: 'EPIC Card (Voter ID) received/downloaded' }
        ]
      },
      {
        key: 'documents', label: 'Documents', icon: '🪪', weight: 30,
        dependsOn: 'registration',
        items: [
          { id: 4, label: 'Original EPIC Card ready' },
          { id: 5, label: 'Aadhar/PAN as backup ID' }
        ]
      },
      {
        key: 'polling', label: 'Polling Day', icon: '🗳️', weight: 30,
        dependsOn: 'documents',
        items: [
          { id: 6, label: 'Constituency & Booth Number located' },
          { id: 7, label: 'Voter Information Slip printed' },
          { id: 8, label: 'EVM/VVPAT procedure understood' }
        ]
      }
    ],
    P02: DEFAULT_CHECKLIST, P03: DEFAULT_CHECKLIST, P04: DEFAULT_CHECKLIST, P05: DEFAULT_CHECKLIST, P06: DEFAULT_CHECKLIST
  },
  USA: {
    P01: [
      {
        key: 'registration', label: 'Registration', icon: '📋', weight: 35,
        dependsOn: null,
        items: [
          { id: 0, label: 'State registration portal check' },
          { id: 1, label: 'Registration status "Active"' },
          { id: 2, label: 'Party affiliation verified (for Primaries)' }
        ]
      },
      {
        key: 'id_requirements', label: 'Identification', icon: '🪪', weight: 30,
        dependsOn: 'registration',
        items: [
          { id: 3, label: 'State-issued Photo ID valid' },
          { id: 4, label: 'Name on ID matches registration' }
        ]
      },
      {
        key: 'voting_plan', label: 'Voting Plan', icon: '📍', weight: 35,
        dependsOn: 'id_requirements',
        items: [
          { id: 5, label: 'Polling place located (Precinct)' },
          { id: 6, label: 'Early voting dates checked' },
          { id: 7, label: 'Time off work scheduled' }
        ]
      }
    ],
    P02: DEFAULT_CHECKLIST, P03: DEFAULT_CHECKLIST, P04: DEFAULT_CHECKLIST, P05: DEFAULT_CHECKLIST, P06: DEFAULT_CHECKLIST
  },
  GBR: {
    P01: DEFAULT_CHECKLIST, P02: DEFAULT_CHECKLIST, P03: DEFAULT_CHECKLIST, P04: DEFAULT_CHECKLIST, P05: DEFAULT_CHECKLIST, P06: DEFAULT_CHECKLIST
  },
  CAN: {
    P01: DEFAULT_CHECKLIST, P02: DEFAULT_CHECKLIST, P03: DEFAULT_CHECKLIST, P04: DEFAULT_CHECKLIST, P05: DEFAULT_CHECKLIST, P06: DEFAULT_CHECKLIST
  },
  AUS: {
    P01: DEFAULT_CHECKLIST, P02: DEFAULT_CHECKLIST, P03: DEFAULT_CHECKLIST, P04: DEFAULT_CHECKLIST, P05: DEFAULT_CHECKLIST, P06: DEFAULT_CHECKLIST
  }
};

export function getChecklist(country: CountryCode | null, persona: PersonaCode | null): ChecklistDomain[] {
  if (!country || !persona) return DEFAULT_CHECKLIST;
  return CHECKLISTS_BY_COUNTRY[country]?.[persona] || DEFAULT_CHECKLIST;
}
