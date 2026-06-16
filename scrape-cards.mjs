#!/usr/bin/env node
/**
 * scrape-cards.mjs — heraldhelper.com card scraper
 * Usage:  node scrape-cards.mjs
 * Output: scraped-cards.json
 */

import { writeFileSync } from 'fs';

const BASE        = 'https://heraldhelper.com';
const OUTPUT      = './scraped-cards.json';
const DELAY_MS    = 600;
const START_SLUG  = 'sigrith-andravos';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Decode HTML entities ───────────────────────────────────────────────────────
function ent(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .trim();
}

// Strip inner tags but keep text content
function innerText(html) {
  return ent(html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
async function fetchHtml(slug) {
  const res = await fetch(`${BASE}/cards/${slug}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; personal-scraper/1.0)',
      'Accept': 'text/html',
    },
  });
  if (!res.ok) { console.error(`  ✗ HTTP ${res.status} — ${slug}`); return null; }
  return res.text();
}

// ── Parse card ────────────────────────────────────────────────────────────────
function parseCard(html, slug) {

  // Helpers
  const first = (re) => { const m = html.match(re); return m ? ent(m[1]) : null; };
  const all   = (re) => { const out = []; let m; const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); while ((m = g.exec(html)) !== null) out.push(ent(m[1])); return out; };

  // Name
  const name = first(/<h1[^>]*>([^<]+)<\/h1>/i) ?? slug;

  // Rank
  const RANKS = ['Legendary', 'Unique', 'Elite', 'Basic'];
  const rank  = RANKS.find(r => new RegExp(`>${r}<`).test(html)) ?? 'Basic';

  // Factions — extract stone-200 badge text dynamically, normalize Conclave name
  const factionRaw = all(/bg-stone-200[^>]*>([^<]+)<\/span>/);
  const faction = [...new Set(factionRaw.map(f =>
    f === 'Conclave of the Sphere' ? 'Conclave of the Spheres' : f
  ))].filter(f => f.length > 2);

  // Type — href="/?type=..."
  const type = first(/href="\/?[?]type=([^"&]+)"/) ?? 'Unit';

  // Traits — href="/?trait=..."
  const traits = all(/href="\/?[?]trait=([^"&]+)"/);

  // ── Stats — pattern: >Label</span></div><span...>VALUE</span> ────────────────
  const stat = (label) => {
    const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Handle optional sublabel div between </span></div> and value span
    const re = new RegExp(
      `>${esc}<\\/span>(?:<div[^>]*>[^<]*<\\/div>)?<\\/div><span[^>]*>([^<]+)<\\/span>`,
      'i'
    );
    return first(re);
  };

  const cost      = parseInt(stat('Echo cost') ?? '0', 10);
  const accuracyS = stat('Accuracy');
  const powerS    = stat('Power');     // "5/3" or "5"
  const rangeS    = stat('Range');
  const speedS    = stat('Speed');
  const defenseS  = stat('Defense');
  const healthS   = stat('Max Health');
  const baseSize  = stat('Base') ?? undefined;

  const accuracy  = accuracyS !== null ? parseInt(accuracyS, 10) : undefined;
  const range     = rangeS    !== null ? parseInt(rangeS, 10)    : undefined;
  const speed     = speedS    !== null ? parseInt(speedS, 10)    : undefined;
  const defense   = defenseS  !== null ? parseInt(defenseS, 10)  : undefined;
  const maxHealth = healthS   !== null ? parseInt(healthS, 10)   : undefined;

  let powerHit, powerGraze;
  if (powerS) {
    const pm = powerS.match(/^(\d+)\/(\d+)$/);
    if (pm) { powerHit = parseInt(pm[1]); powerGraze = parseInt(pm[2]); }
    else { powerHit = parseInt(powerS); }
  }

  // ── Abilities ─────────────────────────────────────────────────────────────────
  // Named ability: <p><a href="/?q=Name">Name (cost):</a> text.</p>
  // Plain text:    <p>Spell effect text.</p>
  const abilities = [];

  const rulesStart = html.search(/Rules Text<\/h2>/i);
  if (rulesStart !== -1) {
    const rulesBlock = html.slice(rulesStart);
    // Find the closing </div></div> that ends the rules text block
    const endMatch = rulesBlock.search(/<\/div><\/div><\/div><\/div>|<section/i);
    const rulesHtml = endMatch !== -1 ? rulesBlock.slice(0, endMatch) : rulesBlock;

    // Named: <a href="/?q=...">Name:</a> text
    const namedRe = /<a[^>]+href="\/?[?]q=[^"]*"[^>]*>([^<]+):<\/a>\s*([\s\S]*?)<\/p>/gi;
    let m;
    while ((m = namedRe.exec(rulesHtml)) !== null) {
      abilities.push({ name: ent(m[1]), text: innerText(m[2]) });
    }

    // Plain: <p>text</p> — only if no named abilities found
    if (abilities.length === 0) {
      const plainRe = /<p>([\s\S]*?)<\/p>/gi;
      while ((m = plainRe.exec(rulesHtml)) !== null) {
        const text = innerText(m[1]);
        if (text) abilities.push({ name: '', text });
      }
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────────
  const prevSlug = first(/href="\/cards\/([a-z0-9-]+)"[^>]*title="Previous card"/i)
                || first(/title="Previous card"[^>]*href="\/cards\/([a-z0-9-]+)"/i);
  const nextSlug = first(/href="\/cards\/([a-z0-9-]+)"[^>]*title="Next card"/i)
                || first(/title="Next card"[^>]*href="\/cards\/([a-z0-9-]+)"/i);

  // ── Image ─────────────────────────────────────────────────────────────────────
  const image = first(/src="(https?:\/\/heraldhelper\.com\/cards\/[^"]+\.(?:webp|png|jpg)[^"]*)"/i)
             ?? first(/src="(\/cards\/[^"]+\.(?:webp|png|jpg)[^"]*)"/)?.replace(/^\//, `${BASE}/`)
             ?? undefined;

  // ── Assemble ──────────────────────────────────────────────────────────────────
  return {
    card: {
      id: slug,
      slug,
      name,
      faction,
      type,
      rank,
      traits,
      cost,
      ...(accuracy  !== undefined && { accuracy  }),
      ...(powerHit  !== undefined && { powerHit  }),
      ...(powerGraze!== undefined && { powerGraze}),
      ...(range     !== undefined && { range     }),
      ...(speed     !== undefined && { speed     }),
      ...(defense   !== undefined && { defense   }),
      ...(maxHealth !== undefined && { maxHealth }),
      ...(baseSize  !== undefined && { baseSize  }),
      abilities,
      ...(image     !== undefined && { image     }),
    },
    prevSlug: prevSlug ?? null,
    nextSlug: nextSlug ?? null,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\nHeraldHelper card scraper (v2)\n');

  // Phase 1: walk backwards to card #1
  console.log('Phase 1: Finding first card...');
  let firstSlug = START_SLUG;
  const seenBack = new Set([firstSlug]);
  while (true) {
    const html = await fetchHtml(firstSlug);
    if (!html) break;
    const { prevSlug } = parseCard(html, firstSlug);
    if (!prevSlug || seenBack.has(prevSlug)) { console.log(`  First card: ${firstSlug}\n`); break; }
    console.log(`  ← ${firstSlug}`);
    seenBack.add(firstSlug);
    firstSlug = prevSlug;
    await sleep(DELAY_MS);
  }

  // Phase 2: walk forward collecting all cards
  console.log('Phase 2: Collecting all cards...');
  const cards   = [];
  const visited = new Set();
  let current   = firstSlug;

  while (current) {
    if (visited.has(current)) { console.log(`  Loop at ${current}, stopping.`); break; }
    visited.add(current);

    process.stdout.write(`  [${String(cards.length + 1).padStart(3)}] ${current.padEnd(45)} `);
    const html = await fetchHtml(current);
    if (!html) { console.log('SKIP'); break; }

    const { card, nextSlug } = parseCard(html, current);
    cards.push(card);

    console.log(`✓  ${card.name} | ${card.type} | ${card.rank} | abilities:${card.abilities.length} | cost:${card.cost}`);

    current = nextSlug;
    if (current) await sleep(DELAY_MS);
  }

  writeFileSync(OUTPUT, JSON.stringify(cards, null, 2), 'utf8');
  console.log(`\n✓ ${cards.length} cards → ${OUTPUT}`);
}

main().catch(err => { console.error('\nFatal:', err); process.exit(1); });
