
import { useUserStore } from '../state/userStore';
import { User, Activity } from '../types';

const MOCK_ACTIVITY: Activity[] = [
  { id: 'act_1', type: 'generation', description: 'Generated app: "Kanban Board"', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'act_2', type: 'upgrade', description: 'Upgraded to Pro tier', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: 'act_3', type: 'invite', description: 'Invited friend: test@example.com', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

const MOCK_USER: User = {
  uid: 'mock-user-123',
  email: 'dev@gnidoc.xyz',
  displayName: 'Gnidoc Developer',
  tier: 'forge',
  credits: 250,
};

// Mock auth functions
export const signIn = () => {
    useUserStore.getState().setLoading(true);
    setTimeout(() => {
        useUserStore.getState().setUser(MOCK_USER, MOCK_ACTIVITY);
        useUserStore.getState().setLoading(false);
    }, 500);
};

export const signOut = () => {
    useUserStore.getState().setLoading(true);
    setTimeout(() => {
        useUserStore.getState().clearUser();
        useUserStore.getState().setLoading(false);
    }, 500);
};


// This hook is to be called once in App.tsx as per existing code.
// In a real app, it would contain the `onAuthStateChanged` listener.
export const useAuth = () => {};
