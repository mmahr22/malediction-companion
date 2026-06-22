import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameRecord, GamePlayerRecord } from '../data/types';

interface HistoryStore {
  records: GameRecord[];
  addRecord: (data: { masteryGoal: number; rounds: number; players: GamePlayerRecord[] }) => void;
  deleteRecord: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      records: [],

      addRecord: (data) =>
        set((state) => ({
          records: [
            { ...data, id: `game-${Date.now()}`, date: Date.now() },
            ...state.records,
          ],
        })),

      deleteRecord: (id) =>
        set((state) => ({ records: state.records.filter((r) => r.id !== id) })),

      clearHistory: () => set({ records: [] }),
    }),
    {
      name: 'malediction:gameHistory',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
