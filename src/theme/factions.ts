export const FACTION_COLORS: Record<string, string> = {
  'Primal Blood': '#CC2200',
  'Legion of the Fallen': '#2A7A2A',
  'Conclave of the Spheres': '#1A5FAD',
  'Order of the Shattered Throne': '#E8E8E8',
};

export const FACTION_IMAGES: Record<string, ReturnType<typeof require>> = {
  'Primal Blood': require('../../assets/factions/faction-primal.png'),
  'Legion of the Fallen': require('../../assets/factions/faction-legion.png'),
  'Conclave of the Spheres': require('../../assets/factions/faction-conclave.png'),
  'Order of the Shattered Throne': require('../../assets/factions/faction-order.png'),
};

export function parseFactions(factionString: string): string[] {
  return factionString.split(' / ').map((f) => f.trim());
}
