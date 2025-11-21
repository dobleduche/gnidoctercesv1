import { create } from 'zustand';
import { User, TierId, Activity } from '../types';

interface UserState {
  user: User | null;
  tier: TierId | null;
  credits: number | null;
  loading: boolean;
  recentActivity: Activity[];
  setUser: (user: User | null, activity: Activity[]) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  tier: null,
  credits: null,
  loading: false, // Start with false, so login button shows immediately
  recentActivity: [],
  setUser: (user, activity) =>
    set((state) => ({
      user,
      tier: user?.tier ?? null,
      credits: user?.credits ?? null,
      recentActivity: activity,
    })),
  clearUser: () =>
    set({
      user: null,
      tier: null,
      credits: null,
      recentActivity: [],
    }),
  setLoading: (loading) => set({ loading }),
  addActivity: (activity) =>
    set((state) => ({
      recentActivity: [
        { ...activity, id: `act_${Date.now()}`, timestamp: new Date().toISOString() },
        ...state.recentActivity,
      ].slice(0, 5), // Keep last 5 activities
    })),
}));
