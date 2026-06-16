import { Seeker } from './types';

export const sampleSeekers: Seeker[] = [
  {
    id: 'seeker-sigrith-andravos',
    name: 'Sigrith Andravos',
    faction: 'Order of the Shattered Throne',
    image: require('../../assets/seekers/sigrith.jpg'),
    legacy: {
      name: 'Andravon',
      description: 'A fragment of the stone statue that once guarded the Throne Chamber of Olem, mounted on a shield. The souls of the Varangast — the Triumvirate\'s personal guard — are bound within it, sacrificing those oath-sworn to protect others.',
      startingEcho: 25,
    },
    description:
      'Smite (2AP): This unit performs a melee attack with +2 ATK that deals 5 extra damage. Heal 3 (1AP): An ally nearby or within range recovers 3 health (once per ally per activation). Provokes retaliation. Aura of Fortitude 1: While other allies are within 6", they get +1 DEF.',
  },
  {
    id: 'seeker-vorendal-dreadheart',
    name: 'Vorendal, the Dreadheart',
    faction: 'Legion of the Fallen',
    image: require('../../assets/seekers/vorendal.jpg'),
    legacy: {
      name: 'Heartlock',
      description: 'Embedded in Vorendal\'s chest, the Heartlock emanates dark energy that sustains both the Fallen knight and the corpses he raises. Crafted from a soul who paved the path to victory through blood and pain, it keeps Vorendal\'s body from rot as long as he walks forward.',
      startingEcho: 25,
    },
    description:
      'Onslaught (2AP): This unit performs up to three separate melee attacks. Aura of Fear 2: While enemies are within 6", they get –2 ATK. Regeneration 2: Whenever you activate this unit, it recovers 2 health.',
  },
  {
    id: 'seeker-thundersteps',
    name: 'Thundersteps',
    faction: 'Primal Blood',
    image: require('../../assets/seekers/thundersteps.jpg'),
    legacy: {
      name: "Storm's Eye",
      description: 'A red gem embedded in Thundersteps\' eye that floods his mind with visions of rage and memories of a long-forgotten crime. It torments and empowers him in equal measure, now charting a path through the Malediction toward answers he has sought for centuries.',
      startingEcho: 25,
    },
    description:
      'Berserk 2: While this unit\'s health is lower than or equal to half its max, it gets +2 DMG. Cleave: Whenever this unit defeats a nearby enemy with a melee attack, it may perform a free melee attack. Devastate 3: This unit deals 3 extra damage on critical hits.',
  },
  {
    id: 'seeker-polinore-prime-archivist',
    name: 'Polinore, Prime Archivist',
    faction: 'Conclave of the Spheres',
    image: require('../../assets/seekers/polinore.jpg'),
    legacy: {
      name: 'Runefold Gauntlet',
      description: 'An ancient gauntlet crafted by Molech himself, using the soul of his most prodigious erisyr apprentice. It allows Polinore to manipulate Liastrum with such potency that the corruption halts at his skin — and seems to grant him glimpses of the near future.',
      startingEcho: 25,
    },
    description:
      'Dual Spell: During this unit\'s activation, if you played a channel from your hand you may play a second one from your hand. Empower Spell 1: During this unit\'s activation, whenever a unit suffers damage from a spell you play, it suffers 1 extra damage. Pinpoint: This unit can trace line of sight through other units.',
  },
  {
    id: 'seeker-auric-evenhand',
    name: 'Auric Evenhand',
    faction: 'Primal Blood / Order of the Shattered Throne',
    image: require('../../assets/seekers/auric.jpg'),
    legacy: {
      name: 'Will of the Forge',
      description: 'A Legacy in two halves: the eponymous hammer, capable of shattering nearly any magical artifact and redirecting its energies into new works, and the Caldera\'s Fist — a metal prosthetic arm Auric sacrificed his own flesh to wield. Together they are a tool of creation, not destruction.',
      startingEcho: 20,
    },
    description:
      'Reforge (2AP): Choose an item of this unit\'s rank or lower from your discard pile. Play and equip it to an ally you own within 6" without spending echo. Provokes retaliation. Man-at-Arms: This unit can equip an extra item. Counterattack: Whenever a hit is scored against this unit, it may retaliate after the damage resolves.',
  },
  {
    id: 'seeker-countess-morrida-umberland',
    name: 'Countess Morrida Umberland',
    faction: 'Legion of the Fallen / Conclave of the Spheres',
    image: require('../../assets/seekers/morrida.jpg'),
    legacy: {
      name: 'Soul-Stitcher',
      description: 'A volatile Conclave artifact that weaves Liastrum and Soulbreath together. It turns away burning Liastrum and draws Soulbreath from those unworthy of its power. In Morrida\'s hands it binds long-dead spirits into empty corpses, defying the boundary between the living and the dead.',
      startingEcho: 20,
    },
    description:
      'Necromancy (2AP): Choose a basic Fallen unit from your discard pile. Play and deploy it nearby without spending echo. Provokes retaliation. Curse 4 (1AP): For each enemy within 6", their owner loses 1 echo (up to 4 echo per activation). Provokes retaliation.',
  },
  {
    id: 'seeker-ingor-spiritbound',
    name: "In'Gor, the Spiritbound",
    faction: 'Primal Blood / Legion of the Fallen',
    image: require('../../assets/seekers/ingor.jpg'),
    legacy: {
      name: 'Effigy of Chaos',
      description: "An ancient weapon believed to have once been wielded by Octna, the Warrior-Prophet. A hunk of metal that offers no will of its own — instead it catalyzes In'Gor's own power, attuning to either spiritual or physical might. Its true potential is the possibility of changing one's body and soul.",
      startingEcho: 20,
    },
    description:
      'Essence Binder 3: Whenever an enemy is defeated during this unit\'s activation, you gain 3 echo. Death\'s Whisper: Whenever a unit within 6" is defeated, look at the top card of your deck. You may place it on the bottom of your deck. Regeneration 2: Whenever you activate this unit, it recovers 2 health.',
  },
  {
    id: 'seeker-londriel-spellwarden',
    name: 'Londriel, Spellwarden',
    faction: 'Conclave of the Spheres / Order of the Shattered Throne',
    image: require('../../assets/seekers/londriel.jpg'),
    legacy: {
      name: 'Ark of Lamentation',
      description: 'A jewel of blue amber containing crystallized Liastrum that has protected Londriel since before the Fall. Unlike ordinary Liastrum, the Ark siphons the power of magic to bring order rather than chaos — stabilizing the fabric of reality wherever wild magic would tear it apart.',
      startingEcho: 20,
    },
    description:
      'Spell Immunity: Whenever a spell would affect this unit, it may ignore that spell. Riposte: Whenever a graze is scored against this unit, it may retaliate after the damage resolves.',
  },
  {
    id: 'seeker-griza-lingering-wound',
    name: 'Griza, Lingering Wound',
    faction: 'Order of the Shattered Throne / Legion of the Fallen',
    image: require('../../assets/seekers/griza.jpg'),
    legacy: {
      name: 'Ihreniv',
      description: 'A golden helm once worn by Ihreniv of the Golden Visage, a Varangast knight whose soul was trapped within by the Triumvirate as punishment for defiance. The helm grants Griza unnatural control over other spirits, binding those whose oaths it enforces forevermore to carry out its will.',
      startingEcho: 20,
    },
    description:
      'Spirit Master (1AP): Another Spirit ally within 6" performs a melee attack using this unit\'s ATK, DMG, and abilities instead of its own. Soul Sacrifice: During this unit\'s activation, whenever you play a spell, you may deal damage to this unit equal to the spell\'s cost instead of spending echo.',
  },
  {
    id: 'seeker-kar-mamok',
    name: 'Kar-Mamok',
    faction: 'Primal Blood / Conclave of the Spheres',
    image: require('../../assets/seekers/kar-mamok.jpg'),
    legacy: {
      name: 'Liena, Who Dreams',
      description: 'The bloodcrafted primordial clay golem is itself the Legacy. The mage Liena implanted the construct within her own flesh and entered a comatose state within it. Liastrum seeps from Liena\'s sleeping body into the golem, and Kar-Mamok may freely empower itself through her power — so long as it brings her closer to her goal.',
      startingEcho: 20,
    },
    description:
      'Shielded 2: While this unit is refreshed, whenever it is dealt damage, it suffers 2 fewer damage. Mystic Reverberation: While this unit is exhausted, whenever you resolve a basic or elite spell that affects this unit, you may repeat its effects on another unit within 6".',
  },
];
