import { Card } from './types';

// Placeholder data so the Card Database screen has something to render.
// Replace with real Malediction card data as it's compiled.
export const sampleCards: Card[] = [
  {
    id: 'card-001',
    name: 'Cursed Vanguard',
    faction: 'Shadow Covenant',
    type: 'Unit',
    cost: 4,
    description: 'A frontline unit empowered by dark rituals. Placeholder card.',
  },
  {
    id: 'card-002',
    name: 'Hexbound Sentinel',
    faction: 'Shadow Covenant',
    type: 'Unit',
    cost: 3,
    description: 'Guards nearby allies, absorbing damage meant for them. Placeholder card.',
  },
  {
    id: 'card-003',
    name: 'Withering Bolt',
    faction: 'Shadow Covenant',
    type: 'Tactic',
    cost: 2,
    description: 'Deal damage to an enemy unit and reduce its resource generation. Placeholder card.',
  },
  {
    id: 'card-004',
    name: 'Ironclad Defender',
    faction: 'Iron Legion',
    type: 'Unit',
    cost: 5,
    description: 'A heavily armored unit that excels at holding objectives. Placeholder card.',
  },
  {
    id: 'card-005',
    name: 'Supply Cache',
    faction: 'Iron Legion',
    type: 'Resource',
    cost: 1,
    description: 'Generates additional resource points each round. Placeholder card.',
  },
];
