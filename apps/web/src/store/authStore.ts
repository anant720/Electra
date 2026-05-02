import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  setTokens: (access: string, refresh: string) => void;
  completeOnboarding: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      onboardingComplete: false,
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true }),
      completeOnboarding: () =>
        set({ onboardingComplete: true }),
      logout: () =>
        set({ accessToken: null, refreshToken: null, isAuthenticated: false, onboardingComplete: false }),
    }),
    {
      name: 'electra-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
