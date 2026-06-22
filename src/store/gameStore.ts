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
  undoStack: Array<{ players: Player[]; round: number; initiativePlayerId: string | null }>;
  startGame: (players: PlayerSetup[], masteryGoal: number) => void;
  adjustMastery: (playerId: string, amount: number) => void;
  adjustEcho: (playerId: string, amount: number) => void;
  adjustHusks: (playerId: string, amount: number) => void;
  claimInitiative: (playerId: string) => void;
  incrementRound: () => void;
  decrementRound: () => void;
  resetGame: () => void;
  undo: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      const pushUndo = () => {
        const { players, round, initiativePlayerId, undoStack } = get();
        const snapshot = { players: players.map((p) => ({ ...p })), round, initiativePlayerId };
        const next = [...undoStack, snapshot];
        if (next.length > 20) next.splice(0, next.length - 20);
        set({ undoStack: next });
      };

      return {
        players: [],
        isActive: false,
        round: 1,
        masteryGoal: 45,
        initiativePlayerId: null,
        undoStack: [],

        startGame: (playerSetups, masteryGoal) =>
          set({
            isActive: true,
            round: 1,
            masteryGoal,
            initiativePlayerId: null,
            undoStack: [],
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

        adjustMastery: (playerId, amount) => {
          pushUndo();
          set((state) => ({
            players: state.players.map((p) =>
              p.id === playerId
                ? { ...p, mastery: Math.max(0, (p.mastery ?? 0) + amount) }
                : p
            ),
          }));
        },

        adjustEcho: (playerId, amount) => {
          pushUndo();
          set((state) => ({
            players: state.players.map((p) =>
              p.id === playerId
                ? { ...p, echo: Math.max(0, (p.echo ?? 0) + amount) }
                : p
            ),
          }));
        },

        adjustHusks: (playerId, amount) => {
          pushUndo();
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
          });
        },

        claimInitiative: (playerId) => {
          pushUndo();
          set({ initiativePlayerId: playerId });
        },

        // Advancing the round auto-adds Echo to every player.
        // Amount = round × 2, capped at round 5 (max 10 Echo per advance).
        incrementRound: () => {
          pushUndo();
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
          });
        },

        decrementRound: () => set((state) => ({ round: Math.max(1, state.round - 1) })),

        resetGame: () => set({ players: [], isActive: false, round: 1, masteryGoal: 45, initiativePlayerId: null, undoStack: [] }),

        undo: () => {
          const { undoStack } = get();
          if (undoStack.length === 0) return;
          const prev = undoStack[undoStack.length - 1];
          set({
            players: prev.players,
            round: prev.round,
            initiativePlayerId: prev.initiativePlayerId,
            undoStack: undoStack.slice(0, -1),
          });
        },
      };
    },
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
