import { Card } from '../data/types';

interface DeckEditorBridge {
  addCard: (card: Card) => void;
  removeCard: (card: Card) => void;
  getCount: (cardId: string) => number;
  getLimit: (card: Card) => number;
}

export let activeBridge: DeckEditorBridge | null = null;

export function registerBridge(bridge: DeckEditorBridge) {
  activeBridge = bridge;
}

export function unregisterBridge() {
  activeBridge = null;
}
