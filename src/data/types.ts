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
  husks: number;
  seeker: Seeker | null;
  profileId: string | null;
}

export interface GameState {
  players: Player[];
  isActive: boolean;
  round: number;
  masteryGoal: number;
  initiativePlayerId: string | null;
}

export interface PlayerProfile {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface GamePlayerRecord {
  name: string;
  seekerName: string | null;
  finalMastery: number;
  husks: number;
  isWinner: boolean;
  profileId?: string;
}

export interface GameRecord {
  id: string;
  date: number;
  masteryGoal: number;
  rounds: number;
  players: GamePlayerRecord[];
}

export interface CardAbility {
  name: string;
  text: string;
}

export interface Card {
  id: string;
  slug: string;
  name: string;
  faction: string[];
  type: 'Unit' | 'Channel' | 'Item' | 'Terrain' | 'Swift' | 'Relic';
  rank: 'Basic' | 'Elite' | 'Unique' | 'Legendary';
  traits: string[];
  cost: number;
  // Unit stats
  accuracy?: number;
  powerHit?: number;
  powerGraze?: number;
  range?: number;
  speed?: number;
  defense?: number;
  maxHealth?: number;
  baseSize?: string;
  abilities: CardAbility[];
  image?: string;
}

export interface Deck {
  id: string;
  name: string;
  cardIds: string[];
}
