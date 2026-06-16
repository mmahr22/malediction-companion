import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Player, Seeker } from '../data/types';

interface PlayerSetup {
  name: string;
  seeker: Seeker | null;
  profileId: string | null;
}

interface GameStore extends GameState {
  startGame: (players: PlayerSetup[], masteryGoal: number) => void;
  adjustMastery: (playerId: string, amount: number) => void;
  adjustEcho: (playerId: string, amount: number) => void;
  adjustHusks: (playerId: string, amount: number) => void;
  claimInitiative: (playerId: string) => void;
  incrementRound: () => void;
  decrementRound: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      players: [],
      isActive: false,
      round: 1,
      masteryGoal: 45,
      initiativePlayerId: null,

      startGame: (playerSetups, masteryGoal) =>
        set({
          isActive: true,
          round: 1,
          masteryGoal,
          initiativePlayerId: null,
          players: playerSetups.map(({ name, seeker, profileId }, index): Player => ({
            id: `player-${index}-${Date.now()}`,
            name: name.trim() || `Player ${index + 1}`,
            mastery: 0,
            echo: seeker?.legacy.startingEcho ?? 0,
            husks: 0,
            seeker,
            profileId,
          })),
        }),

      adjustMastery: (playerId, amount) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId
              ? { ...p, mastery: Math.max(0, (p.mastery ?? 0) + amount) }
              : p
          ),
        })),

      adjustEcho: (playerId, amount) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId
              ? { ...p, echo: Math.max(0, (p.echo ?? 0) + amount) }
              : p
          ),
        })),

      adjustHusks: (playerId, amount) =>
        set((state) => {
          const player = state.players.find((p) => p.id === playerId);
          if (!player) return state;
          const maxHusks = state.masteryGoal === 25 ? 2 : 4;
          const currentHusks = player.husks ?? 0;
          const totalOtherHusks = state.players
            .filter((p) => p.id !== playerId)
            .reduce((sum, p) => sum + (p.husks ?? 0), 0);
          const maxForThisPlayer = Math.max(0, maxHusks - totalOtherHusks);
          const newHusks = Math.min(Math.max(0, currentHusks + amount), maxForThisPlayer);
          const delta = newHusks - currentHusks;
          if (delta === 0) return state;
          return {
            players: state.players.map((p) =>
              p.id === playerId
                ? { ...p, husks: newHusks, mastery: Math.max(0, (p.mastery ?? 0) + delta * 10) }
                : p
            ),
          };
        }),

      claimInitiative: (playerId) => set({ initiativePlayerId: playerId }),

      // Advancing the round auto-adds Echo to every player.
      // Amount = round × 2, capped at round 5 (max 10 Echo per advance).
      incrementRound: () =>
        set((state) => {
          const newRound = state.round + 1;
          const echoGain = Math.min(newRound, 5) * 2;
          return {
            round: newRound,
            players: state.players.map((p) => ({
              ...p,
              echo: (p.echo ?? 0) + echoGain,
            })),
          };
        }),

      decrementRound: () => set((state) => ({ round: Math.max(1, state.round - 1) })),

      resetGame: () => set({ players: [], isActive: false, round: 1, masteryGoal: 45, initiativePlayerId: null }),
    }),
    {
      name: 'malediction:gameState',
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (stored: unknown) => {
        const state = stored as Record<string, unknown>;
        if (Array.isArray(state?.players)) {
          state.players = (state.players as Record<string, unknown>[]).map((p) => ({
            ...p,
            mastery: (p.mastery ?? (p as Record<string, unknown>).victoryPoints ?? 0) as number,
            echo: (p.echo ?? (p as Record<string, unknown>).resourcePoints ?? 0) as number,
            husks: (p.husks ?? 0) as number,
            seeker: (p.seeker ?? null) as unknown,
            profileId: (p.profileId ?? null) as string | null,
          }));
        }
        if (state.masteryGoal === undefined) state.masteryGoal = 45;
        if (state.initiativePlayerId === undefined) state.initiativePlayerId = null;
        return state;
      },
    }
  )
);
