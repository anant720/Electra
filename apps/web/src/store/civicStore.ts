import { create } from 'zustand';

import { persist, createJSONStorage } from 'zustand/middleware';
import type { CountryCode, PersonaCode } from '@electra/types';


interface CivicState {
  countryCode: CountryCode | null;
  stateOrProvince: string | null;
  personaCode: PersonaCode | null;
  personaConfidence: number;
  subscribedElectionId: string | null;
  lastQueryIntent: string | null;
  completedRegistrationSteps: number[];
  checklistStates: Record<string, boolean>;

  setCountry: (code: CountryCode) => void;
  setState: (state: string | null) => void;
  setPersona: (code: PersonaCode, confidence?: number) => void;
  setElection: (electionId: string) => void;
  toggleRegistrationStep: (stepIndex: number) => void;
  toggleChecklistItem: (itemId: string) => void;
  reset: () => void;
}


export const useCivicStore = create<CivicState>()(
  persist(
    (set) => ({
      countryCode: null,
      stateOrProvince: null,
      personaCode: null,
      personaConfidence: 0,
      subscribedElectionId: null,
      lastQueryIntent: null,
      completedRegistrationSteps: [],
      checklistStates: {},

      setCountry: (code) => set({ countryCode: code, completedRegistrationSteps: [], checklistStates: {} }),
      setState: (state) => set({ stateOrProvince: state }),
      setPersona: (code, confidence = 1.0) => set({ personaCode: code, personaConfidence: confidence }),
      setElection: (id) => set({ subscribedElectionId: id }),
      toggleRegistrationStep: (stepIndex: number) => set((state) => {
        const steps = new Set(state.completedRegistrationSteps);
        steps.has(stepIndex) ? steps.delete(stepIndex) : steps.add(stepIndex);
        return { completedRegistrationSteps: Array.from(steps) };
      }),
      toggleChecklistItem: (itemId: string) => set((state) => ({
        checklistStates: {
          ...state.checklistStates,
          [itemId]: !state.checklistStates[itemId]
        }
      })),
      reset: () => set({
        countryCode: null,
        personaCode: null,
        stateOrProvince: null,
        completedRegistrationSteps: [],
        checklistStates: {}
      }),

    }),
    {
      name: 'electra-civic-context',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
