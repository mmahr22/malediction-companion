import { Card, Deck } from '../data/types';

export type CardsStackParamList = {
  CardDatabase: undefined;
  CardDetail: { card: Card };
};

export type DecksStackParamList = {
  DeckList: undefined;
  DeckSummary: { deck: Deck };
  DeckEditor: { deck?: Deck };
  DeckCardDetail: { card: Card };
};
