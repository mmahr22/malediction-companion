export interface Legacy {
  name: string;
  description: string;
  startingEcho: number;
}

export interface Seeker {
  id: string;
  name: string;
  faction: string;
  description: string;
  legacy: Legacy;
  image?: ReturnType<typeof require>;
}

export interface Player {
  id: string;
  name: string;
  mastery: number;
  echo: number;
  seeker: Seeker | null;
}

export interface GameState {
  players: Player[];
  isActive: boolean;
  round: number;
}

export interface Card {
  id: string;
  name: string;
  faction: string;
  type: string;
  cost: number;
  description: string;
}

export interface Deck {
  id: string;
  name: string;
  cardIds: string[];
}
