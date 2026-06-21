import { create } from 'zustand';
import { Deck } from '../data/types';
import { getItem, setItem, StorageKeys } from '../storage/storage';

interface DeckStore {
  decks: Deck[];
  loaded: boolean;
  load: () => Promise<void>;
  addDeck: (deck: Deck) => void;
  updateDeck: (deck: Deck) => void;
  deleteDeck: (id: string) => void;
}

export const useDeckStore = create<DeckStore>((set, get) => ({
  decks: [],
  loaded: false,

  load: async () => {
    const stored = await getItem<Deck[]>(StorageKeys.DECKS);
    set({ decks: stored ?? [], loaded: true });
  },

  addDeck: (deck) => {
    const decks = [...get().decks, deck];
    set({ decks });
    setItem(StorageKeys.DECKS, decks);
  },

  updateDeck: (deck) => {
    const decks = get().decks.map((d) => (d.id === deck.id ? deck : d));
    set({ decks });
    setItem(StorageKeys.DECKS, decks);
  },

  deleteDeck: (id) => {
    const decks = get().decks.filter((d) => d.id !== id);
    set({ decks });
    setItem(StorageKeys.DECKS, decks);
  },
}));
