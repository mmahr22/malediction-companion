import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerProfile } from '../data/types';

interface ProfileStore {
  profiles: PlayerProfile[];
  createProfile: (name: string, color: string) => PlayerProfile;
  deleteProfile: (id: string) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profiles: [],

      createProfile: (name, color) => {
        const profile: PlayerProfile = {
          id: `profile-${Date.now()}`,
          name: name.trim(),
          color,
          createdAt: Date.now(),
        };
        set((state) => ({ profiles: [...state.profiles, profile] }));
        return profile;
      },

      deleteProfile: (id) =>
        set((state) => ({ profiles: state.profiles.filter((p) => p.id !== id) })),
    }),
    {
      name: 'malediction:profiles',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
