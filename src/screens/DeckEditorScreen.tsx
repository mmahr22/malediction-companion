import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { cards } from '../data/cards';
import { sampleSeekers } from '../data/sampleSeekers';
import { Card, Deck, Seeker } from '../data/types';
import { useDeckStore } from '../store/deckStore';
import { registerBridge, unregisterBridge } from '../store/deckEditorBridge';
import { DecksStackParamList } from '../navigation/types';
import { FACTION_IMAGES } from '../theme/factions';
import { colors, fonts, radius, spacing } from '../theme/theme';

type EditorRoute = RouteProp<DecksStackParamList, 'DeckEditor'>;

const COPY_LIMITS: Record<Card['rank'], number> = {
  Basic: 3,
  Elite: 2,
  Unique: 1,
  Legendary: 0,
};

function getSeekerFactions(seeker: Seeker): string[] {
  return seeker.faction.split(' / ').map((f) => f.trim());
}

function isCardLegalForSeeker(card: Card, seeker: Seeker): boolean {
  if (card.faction.length === 0) return true;
  const seekerFactions = getSeekerFactions(seeker);
  if (seekerFactions.length === 1) {
    return card.faction.length === 1 && card.faction[0] === seekerFactions[0];
  }
  return card.faction.some((f) => seekerFactions.includes(f));
}

function getLegacyForSeeker(seeker: Seeker): Card | undefined {
  return cards.find(
    (c) => c.type === 'Legacy' && c.name === seeker.legacy.name,
  );
}

function countCards(deck: Record<string, number>): number {
  return Object.values(deck).reduce((sum, n) => sum + n, 0);
}

type TabKey = 'main' | 'side' | 'terrain';

export function DeckEditorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<EditorRoute>();
  const { addDeck, updateDeck } = useDeckStore();

  const existingDeck = route.params?.deck;
  const isEditing = !!existingDeck;

  const [seekerId, setSeekerId] = useState(existingDeck?.seekerId ?? '');
  const [name, setName] = useState(existingDeck?.name ?? '');
  const [mainDeck, setMainDeck] = useState<Record<string, number>>(
    existingDeck?.mainDeck ?? {},
  );
  const [sideDeck, setSideDeck] = useState<Record<string, number>>(
    existingDeck?.sideDeck ?? {},
  );
  const [terrainId, setTerrainId] = useState<string | null>(
    existingDeck?.terrainId ?? null,
  );
  const [activeTab, setActiveTab] = useState<TabKey>('main');
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'default' | 'name' | 'cost'>('default');
  const [typeFilter, setTypeFilter] = useState<Card['type'] | null>(null);
  const [notes, setNotes] = useState(existingDeck?.notes ?? '');

  const seeker = sampleSeekers.find((s) => s.id === seekerId) ?? null;
  const legacy = seeker ? getLegacyForSeeker(seeker) : null;

  const mainCount = countCards(mainDeck);
  const sideCount = countCards(sideDeck);
  const isMainValid = mainCount >= 30 && mainCount <= 50;
  const isSideValid = sideCount <= 7;
  const isDeckValid = isMainValid && isSideValid;
  const canSave = !!seekerId && name.trim().length > 0;

  const availableCards = useMemo(() => {
    if (!seeker) return [];
    const filtered = cards.filter((c) => {
      if (c.type === 'Legacy') return false;
      if (c.rank === 'Legendary') return false;
      if (c.traits.includes('Relic')) return false;
      if (activeTab === 'terrain') return c.type === 'Terrain';
      if (c.type === 'Terrain') return false;
      if (!isCardLegalForSeeker(c, seeker)) return false;
      if (typeFilter && c.type !== typeFilter) return false;
      const q = query.trim().toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !c.traits.some((t) => t.toLowerCase().includes(q))) return false;
      return true;
    });
    const typePriority: Record<string, number> = { Unit: 0, Spell: 1, Attachment: 2, Terrain: 3 };
    const rankPriority: Record<string, number> = { Basic: 0, Elite: 1, Unique: 2 };
    return filtered.sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortOrder === 'cost') {
        if (b.cost !== a.cost) return b.cost - a.cost;
        return a.name.localeCompare(b.name);
      }
      // default: type -> rank -> name
      const ta = typePriority[a.type] ?? 99;
      const tb = typePriority[b.type] ?? 99;
      if (ta !== tb) return ta - tb;
      const ra = rankPriority[a.rank] ?? 99;
      const rb = rankPriority[b.rank] ?? 99;
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
  }, [seeker, activeTab, query, typeFilter, sortOrder]);

  const deckListCards = useMemo(() => {
    const allIds = new Set([
      ...Object.keys(mainDeck),
      ...Object.keys(sideDeck),
    ]);
    return cards.filter((c) => allIds.has(c.id));
  }, [mainDeck, sideDeck]);

  const terrainCard = terrainId ? cards.find((c) => c.id === terrainId) : null;

  const deckStats = useMemo(() => {
    let units = 0, spells = 0, attachments = 0;
    const costBuckets: Record<number, number> = {};
    for (const [cardId, count] of Object.entries(mainDeck)) {
      const card = cards.find((c) => c.id === cardId);
      if (!card) continue;
      if (card.type === 'Unit') units += count;
      else if (card.type === 'Spell') spells += count;
      else if (card.type === 'Attachment') attachments += count;
      const cost = card.cost;
      costBuckets[cost] = (costBuckets[cost] ?? 0) + count;
    }
    return { units, spells, attachments, costBuckets };
  }, [mainDeck]);

  const copyDeckToClipboard = useCallback(async () => {
    if (!seeker) return;
    const lines: string[] = [];
    lines.push(`# ${name || 'Untitled Deck'}`);
    lines.push(`Seeker: ${seeker.name}`);
    if (legacy) lines.push(`Legacy: ${legacy.name}`);
    if (terrainCard) lines.push(`Terrain: ${terrainCard.name}`);
    lines.push('');
    const grouped: Record<string, { card: Card; count: number }[]> = {};
    for (const [cardId, count] of Object.entries(mainDeck)) {
      const card = cards.find((c) => c.id === cardId);
      if (!card) continue;
      const type = card.type;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push({ card, count });
    }
    for (const type of ['Unit', 'Spell', 'Attachment']) {
      const group = grouped[type];
      if (!group?.length) continue;
      lines.push(`## ${type}s (${group.reduce((s, g) => s + g.count, 0)})`);
      group.sort((a, b) => a.card.name.localeCompare(b.card.name));
      for (const { card, count } of group) {
        lines.push(`${count}x ${card.name}`);
      }
      lines.push('');
    }
    if (Object.keys(sideDeck).length > 0) {
      lines.push(`## Side Deck (${countCards(sideDeck)})`);
      const sideEntries = Object.entries(sideDeck)
        .map(([id, count]) => ({ card: cards.find((c) => c.id === id)!, count }))
        .filter((e) => e.card)
        .sort((a, b) => a.card.name.localeCompare(b.card.name));
      for (const { card, count } of sideEntries) {
        lines.push(`${count}x ${card.name}`);
      }
      lines.push('');
    }
    if (notes.trim()) {
      lines.push(`## Notes`);
      lines.push(notes.trim());
    }
    const text = lines.join('\n');
    await Clipboard.setStringAsync(text);
    if (Platform.OS === 'web') {
      alert('Deck copied to clipboard!');
    } else {
      Alert.alert('Copied', 'Deck list copied to clipboard.');
    }
  }, [seeker, name, legacy, terrainCard, mainDeck, sideDeck, notes]);

  const currentDeckMap = activeTab === 'main' ? mainDeck : sideDeck;
  const setCurrentDeckMap = activeTab === 'main' ? setMainDeck : setSideDeck;

  const getCardCount = useCallback(
    (cardId: string) => {
      if (activeTab === 'terrain') return terrainId === cardId ? 1 : 0;
      return (mainDeck[cardId] ?? 0) + (sideDeck[cardId] ?? 0);
    },
    [mainDeck, sideDeck, terrainId, activeTab],
  );

  const addCard = useCallback(
    (card: Card) => {
      if (activeTab === 'terrain') {
        setTerrainId(terrainId === card.id ? null : card.id);
        return;
      }
      const totalCopies = (mainDeck[card.id] ?? 0) + (sideDeck[card.id] ?? 0);
      const limit = COPY_LIMITS[card.rank];
      if (totalCopies >= limit) return;
      if (activeTab === 'side' && sideCount >= 7) return;
      setCurrentDeckMap((prev) => ({ ...prev, [card.id]: (prev[card.id] ?? 0) + 1 }));
    },
    [mainDeck, sideDeck, activeTab, sideCount, terrainId, setCurrentDeckMap],
  );

  const removeCard = useCallback(
    (card: Card) => {
      if (activeTab === 'terrain') {
        if (terrainId === card.id) setTerrainId(null);
        return;
      }
      const current = currentDeckMap[card.id] ?? 0;
      if (current <= 0) return;
      setCurrentDeckMap((prev) => {
        const next = { ...prev };
        if (current <= 1) delete next[card.id];
        else next[card.id] = current - 1;
        return next;
      });
    },
    [currentDeckMap, activeTab, terrainId, setCurrentDeckMap],
  );

  useEffect(() => {
    registerBridge({
      addCard,
      removeCard,
      getCount: (cardId) => (mainDeck[cardId] ?? 0) + (sideDeck[cardId] ?? 0),
      getLimit: (card) => COPY_LIMITS[card.rank],
    });
    return () => unregisterBridge();
  }, [addCard, removeCard, mainDeck, sideDeck]);

  const handleSave = () => {
    const now = Date.now();
    const deck: Deck = {
      id: existingDeck?.id ?? `deck-${now}`,
      name: name.trim(),
      seekerId,
      mainDeck,
      sideDeck,
      terrainId,
      notes: notes.trim(),
      createdAt: existingDeck?.createdAt ?? now,
      updatedAt: now,
    };
    if (isEditing) updateDeck(deck);
    else addDeck(deck);
    navigation.goBack();
  };

  if (!seekerId) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Text style={styles.sectionTitle}>Choose a Seeker</Text>
        <FlatList
          data={sampleSeekers}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.seekerList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.seekerRow}
              onPress={() => setSeekerId(item.id)}
              activeOpacity={0.75}
            >
              {item.image && (
                <Image source={item.image} style={styles.seekerImage} />
              )}
              <View style={styles.seekerInfo}>
                <Text style={styles.seekerName}>{item.name}</Text>
                <Text style={styles.seekerFaction}>{item.faction}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header: seeker + name */}
      <View style={styles.header}>
        <View style={styles.seekerBadge}>
          {seeker?.image && (
            <Image source={seeker.image} style={styles.seekerThumb} />
          )}
          <Text style={styles.seekerBadgeName} numberOfLines={1}>
            {seeker?.name}
          </Text>
        </View>
        <TextInput
          style={styles.nameInput}
          placeholder="Deck name..."
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Legacy (auto-filled) */}
      {legacy && (
        <View style={styles.legacyBar}>
          <Text style={styles.legacyLabel}>LEGACY</Text>
          <Text style={styles.legacyName}>{legacy.name}</Text>
        </View>
      )}

      {/* Validity + counts */}
      <View style={styles.statsBar}>
        <Text style={[styles.statText, isMainValid ? styles.statValid : mainCount > 0 ? styles.statWarn : null]}>
          Main: {mainCount}/30-50
        </Text>
        <Text style={[styles.statText, isSideValid ? styles.statValid : styles.statWarn]}>
          Side: {sideCount}/7
        </Text>
        {terrainCard && (
          <Text style={styles.statText}>Terrain: {terrainCard.name}</Text>
        )}
      </View>

      {/* Type breakdown */}
      {mainCount > 0 && (
        <View style={styles.typeBreakdown}>
          <Text style={styles.breakdownText}>{deckStats.units} Units</Text>
          <Text style={styles.breakdownSep}>·</Text>
          <Text style={styles.breakdownText}>{deckStats.spells} Spells</Text>
          <Text style={styles.breakdownSep}>·</Text>
          <Text style={styles.breakdownText}>{deckStats.attachments} Attachments</Text>
        </View>
      )}

      {/* Cost curve */}
      {mainCount > 0 && <CostCurve buckets={deckStats.costBuckets} />}

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['main', 'side', 'terrain'] as TabKey[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => { setActiveTab(tab); setQuery(''); setTypeFilter(null); }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'main' ? 'Main Deck' : tab === 'side' ? 'Side Deck' : 'Terrain'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      {activeTab !== 'terrain' && (
        <TextInput
          style={styles.search}
          placeholder="Search cards..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      )}

      {/* Type filter pills */}
      {activeTab !== 'terrain' && (
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>TYPE</Text>
          <View style={styles.filterPills}>
            {(['Unit', 'Spell', 'Attachment'] as Card['type'][]).map((t) => {
              const active = typeFilter === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  onPress={() => setTypeFilter(active ? null : t)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Sort pills */}
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>SORT</Text>
        <View style={styles.filterPills}>
          {([['default', 'Default'], ['name', 'Name'], ['cost', 'Cost']] as const).map(([value, label]) => {
            const active = sortOrder === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setSortOrder(value)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Card list */}
      <FlatList
        data={availableCards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardList}
        renderItem={({ item }) => {
          const inDeck = activeTab === 'terrain'
            ? terrainId === item.id ? 1 : 0
            : currentDeckMap[item.id] ?? 0;
          const totalCopies = getCardCount(item.id);
          const limit = activeTab === 'terrain' ? 1 : COPY_LIMITS[item.rank];
          const atLimit = totalCopies >= limit;

          return (
            <CardBuilderRow
              card={item}
              inDeck={inDeck}
              atLimit={atLimit}
              limit={limit}
              totalCopies={totalCopies}
              onAdd={() => addCard(item)}
              onRemove={() => removeCard(item)}
              onDetail={() => navigation.navigate('DeckCardDetail', { card: item })}
            />
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {seeker ? 'No cards match your search.' : 'Select a seeker to begin.'}
          </Text>
        }
        ListFooterComponent={
          <>
            {/* Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.filterLabel}>NOTES</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Strategy notes, matchup tips..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyDeckToClipboard}
                activeOpacity={0.8}
              >
                <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!canSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>
                  {isEditing ? 'Save Changes' : 'Save Deck'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

function CardBuilderRow({
  card,
  inDeck,
  atLimit,
  limit,
  totalCopies,
  onAdd,
  onRemove,
  onDetail,
}: {
  card: Card;
  inDeck: number;
  atLimit: boolean;
  limit: number;
  totalCopies: number;
  onAdd: () => void;
  onRemove: () => void;
  onDetail: () => void;
}) {
  const rankColor =
    card.rank === 'Legendary'
      ? colors.gold
      : card.rank === 'Unique'
        ? '#E67E22'
        : card.rank === 'Elite'
          ? colors.purple
          : colors.textMuted;

  return (
    <View style={[styles.row, inDeck > 0 && styles.rowInDeck]}>
      <TouchableOpacity style={styles.rowTappable} onPress={onDetail} activeOpacity={0.75}>
        {card.image ? (
          <Image
            source={{ uri: card.image }}
            style={[styles.thumb, styles.thumbBg]}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
        <View style={styles.rowInfo}>
          <View style={styles.rowTop}>
            <Text style={styles.cardName} numberOfLines={1}>
              {card.name}
            </Text>
            <Text style={[styles.rankBadge, { color: rankColor }]}>
              {card.rank}
            </Text>
          </View>
          <View style={styles.rowMeta}>
            {card.faction.map((f) => (
              <Image key={f} source={FACTION_IMAGES[f]} style={styles.factionIcon} />
            ))}
            <Text style={styles.metaText}>{card.type}</Text>
            <Text style={styles.costBadge}>◆ {card.cost}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={onRemove}
          disabled={inDeck <= 0}
        >
          <Text style={[styles.controlText, inDeck <= 0 && styles.controlDisabled]}>−</Text>
        </TouchableOpacity>
        <Text style={styles.countText}>
          {totalCopies}/{limit}
        </Text>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={onAdd}
          disabled={atLimit}
        >
          <Text style={[styles.controlText, atLimit && styles.controlDisabled]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function CostCurve({ buckets }: { buckets: Record<number, number> }) {
  const costs = Object.keys(buckets).map(Number).sort((a, b) => a - b);
  if (costs.length === 0) return null;
  const maxCount = Math.max(...Object.values(buckets));

  return (
    <View style={styles.costCurve}>
      <Text style={styles.filterLabel}>ECHO CURVE</Text>
      <View style={styles.curveRow}>
        {costs.map((cost) => {
          const count = buckets[cost];
          const height = maxCount > 0 ? (count / maxCount) * 40 : 0;
          return (
            <View key={cost} style={styles.curveCol}>
              <Text style={styles.curveCount}>{count}</Text>
              <View style={[styles.curveBar, { height: Math.max(height, 2) }]} />
              <Text style={styles.curveCost}>{cost}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  seekerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  seekerThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  seekerBadgeName: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.gold,
    flex: 1,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 14,
  },
  legacyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  legacyLabel: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  legacyName: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.purple,
  },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.lg,
  },
  statText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  statValid: {
    color: '#2A7A2A',
  },
  statWarn: {
    color: colors.danger,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: {
    borderColor: colors.gold,
    backgroundColor: `${colors.gold}20`,
  },
  tabText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  tabTextActive: {
    color: colors.gold,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 13,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 4,
  },
  filterLabel: {
    fontFamily: fonts.heading,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  filterPills: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterPill: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  filterPillActive: {
    borderColor: colors.gold,
    backgroundColor: `${colors.gold}20`,
  },
  filterPillText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  filterPillTextActive: {
    color: colors.gold,
  },
  cardList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
  },
  rowInDeck: {
    borderColor: colors.gold,
  },
  rowTappable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 48,
    height: 62,
  },
  thumbBg: {
    backgroundColor: colors.surface,
  },
  thumbPlaceholder: {
    backgroundColor: colors.border,
  },
  rowInfo: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    justifyContent: 'space-between',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
  },
  cardName: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  rankBadge: {
    fontFamily: fonts.heading,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  factionIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  metaText: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.textMuted,
  },
  costBadge: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.purple,
    marginLeft: 'auto',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    gap: 2,
  },
  controlBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.gold,
  },
  controlDisabled: {
    color: colors.border,
  },
  countText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  typeBreakdown: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: 4,
    alignItems: 'center',
    gap: 6,
  },
  breakdownText: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  breakdownSep: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.border,
  },
  costCurve: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  curveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  curveCol: {
    alignItems: 'center',
    minWidth: 20,
  },
  curveCount: {
    fontFamily: fonts.heading,
    fontSize: 8,
    color: colors.textMuted,
    marginBottom: 2,
  },
  curveBar: {
    width: 16,
    backgroundColor: colors.purple,
    borderRadius: 2,
  },
  curveCost: {
    fontFamily: fonts.heading,
    fontSize: 8,
    color: colors.textMuted,
    marginTop: 2,
  },
  notesSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 4,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 12,
    minHeight: 60,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  copyButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  copyButtonText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.gold,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.background,
    letterSpacing: 1,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.heading,
    marginTop: 40,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.gold,
    padding: spacing.lg,
  },
  seekerList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  seekerRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
  },
  seekerImage: {
    width: 60,
    height: 60,
  },
  seekerInfo: {
    flex: 1,
    padding: spacing.md,
  },
  seekerName: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  seekerFaction: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
