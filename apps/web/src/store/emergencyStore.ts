import { create } from 'zustand';
import { CountryCode, TroubleshootingScenario } from '@electra/types';

interface EmergencyState {
  isActive: boolean;
  scenario: TroubleshootingScenario | null;
  countryCode: CountryCode | null;
  stepsShown: number[];
  escalationLevel: number;
  startedAt: Date | null;

  activateEmergency: (scenario: TroubleshootingScenario, country: CountryCode) => void;
  markStepShown: (step: number) => void;
  escalate: () => void;
  exitEmergency: () => void;
}

export const useEmergencyStore = create<EmergencyState>()((set) => ({
  isActive: false,
  scenario: null,
  countryCode: null,
  stepsShown: [],
  escalationLevel: 1,
  startedAt: null,

  activateEmergency: (scenario, country) =>
    set({ isActive: true, scenario, countryCode: country, startedAt: new Date(), escalationLevel: 1 }),
  markStepShown: (step) => set((s) => ({ stepsShown: [...s.stepsShown, step] })),
  escalate: () => set((s) => ({ escalationLevel: Math.min(s.escalationLevel + 1, 5) })),
  exitEmergency: () =>
    set({ isActive: false, scenario: null, stepsShown: [], escalationLevel: 1 }),
}));
