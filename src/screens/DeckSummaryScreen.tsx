import React, { useMemo } from 'react';
import {
  Alert,
  Image,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cards } from '../data/cards';
import { sampleSeekers } from '../data/sampleSeekers';
import { Card } from '../data/types';
import { DecksStackParamList } from '../navigation/types';
import { FACTION_IMAGES } from '../theme/factions';
import { colors, fonts, radius, spacing } from '../theme/theme';

type Route = RouteProp<DecksStackParamList, 'DeckSummary'>;
type Navigation = NativeStackNavigationProp<DecksStackParamList, 'DeckSummary'>;

function countCards(deck: Record<string, number>): number {
  return Object.values(deck).reduce((sum, n) => sum + n, 0);
}

function getLegacyForSeeker(seekerLegacyName: string): Card | undefined {
  return cards.find((c) => c.type === 'Legacy' && c.name === seekerLegacyName);
}

type Section = { title: string; data: { card: Card; count: number }[] };

export function DeckSummaryScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { deck } = route.params;

  const seeker = sampleSeekers.find((s) => s.id === deck.seekerId);
  const legacy = seeker ? getLegacyForSeeker(seeker.legacy.name) : null;
  const terrainCard = deck.terrainId ? cards.find((c) => c.id === deck.terrainId) : null;
  const mainCount = countCards(deck.mainDeck);
  const sideCount = countCards(deck.sideDeck);
  const isMainValid = mainCount >= 30 && mainCount <= 50;

  const stats = useMemo(() => {
    let units = 0, spells = 0, attachments = 0;
    const costBuckets: Record<number, number> = {};
    for (const [cardId, count] of Object.entries(deck.mainDeck)) {
      const card = cards.find((c) => c.id === cardId);
      if (!card) continue;
      if (card.type === 'Unit') units += count;
      else if (card.type === 'Spell') spells += count;
      else if (card.type === 'Attachment') attachments += count;
      costBuckets[card.cost] = (costBuckets[card.cost] ?? 0) + count;
    }
    return { units, spells, attachments, costBuckets };
  }, [deck.mainDeck]);

  const sections = useMemo(() => {
    const result: Section[] = [];
    const grouped: Record<string, { card: Card; count: number }[]> = {};
    for (const [cardId, count] of Object.entries(deck.mainDeck)) {
      const card = cards.find((c) => c.id === cardId);
      if (!card) continue;
      if (!grouped[card.type]) grouped[card.type] = [];
      grouped[card.type].push({ card, count });
    }
    for (const type of ['Unit', 'Spell', 'Attachment']) {
      const group = grouped[type];
      if (!group?.length) continue;
      group.sort((a, b) => a.card.name.localeCompare(b.card.name));
      const total = group.reduce((s, g) => s + g.count, 0);
      result.push({ title: `${type}s (${total})`, data: group });
    }
    if (Object.keys(deck.sideDeck).length > 0) {
      const sideEntries = Object.entries(deck.sideDeck)
        .map(([id, count]) => ({ card: cards.find((c) => c.id === id)!, count }))
        .filter((e) => e.card)
        .sort((a, b) => a.card.name.localeCompare(b.card.name));
      result.push({ title: `Side Deck (${sideCount})`, data: sideEntries });
    }
    return result;
  }, [deck.mainDeck, deck.sideDeck, sideCount]);

  const costKeys = Object.keys(stats.costBuckets).map(Number).sort((a, b) => a - b);
  const maxCostCount = costKeys.length > 0 ? Math.max(...Object.values(stats.costBuckets)) : 0;

  const copyDeckToClipboard = async () => {
    const lines: string[] = [];
    lines.push(`# ${deck.name}`);
    lines.push(`Seeker: ${seeker?.name ?? 'Unknown'}`);
    if (legacy) lines.push(`Legacy: ${legacy.name}`);
    if (terrainCard) lines.push(`Terrain: ${terrainCard.name}`);
    lines.push('');
    for (const section of sections) {
      lines.push(`## ${section.title}`);
      for (const { card, count } of section.data) {
        lines.push(`${count}x ${card.name}`);
      }
      lines.push('');
    }
    if (deck.notes?.trim()) {
      lines.push(`## Notes`);
      lines.push(deck.notes.trim());
    }
    await Clipboard.setStringAsync(lines.join('\n'));
    if (Platform.OS === 'web') alert('Deck copied to clipboard!');
    else Alert.alert('Copied', 'Deck list copied to clipboard.');
  };

  const navigateToCard = (card: Card) => {
    navigation.navigate('DeckCardDetail', { card });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.card.id + index}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Seeker header */}
            <View style={styles.seekerHeader}>
              {seeker?.image && (
                <Image source={seeker.image} style={styles.seekerImage} />
              )}
              <View style={styles.seekerInfo}>
                <Text style={styles.deckName}>{deck.name}</Text>
                <Text style={styles.seekerName}>{seeker?.name ?? 'Unknown Seeker'}</Text>
                <Text style={styles.seekerFaction}>{seeker?.faction}</Text>
              </View>
            </View>

            {/* Legacy + Terrain */}
            <View style={styles.metaRow}>
              {legacy && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>LEGACY</Text>
                  <Text style={styles.metaValue}>{legacy.name}</Text>
                </View>
              )}
              {terrainCard && (
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>TERRAIN</Text>
                  <Text style={styles.metaValue}>{terrainCard.name}</Text>
                </View>
              )}
            </View>

            {/* Card counts */}
            <View style={styles.countsRow}>
              <Text style={[styles.countText, isMainValid ? styles.countValid : styles.countWarn]}>
                {mainCount} cards
              </Text>
              <Text style={styles.breakdownText}>
                {stats.units} Units · {stats.spells} Spells · {stats.attachments} Attachments
              </Text>
              {sideCount > 0 && (
                <Text style={styles.sideCountText}>Side: {sideCount}</Text>
              )}
            </View>

            {/* Cost curve */}
            {costKeys.length > 0 && (
              <View style={styles.costCurve}>
                <Text style={styles.sectionLabel}>ECHO CURVE</Text>
                <View style={styles.curveRow}>
                  {costKeys.map((cost) => {
                    const count = stats.costBuckets[cost];
                    const height = maxCostCount > 0 ? (count / maxCostCount) * 40 : 0;
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
            )}
          </>
        }
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.cardRow}
            onPress={() => navigateToCard(item.card)}
            activeOpacity={0.75}
          >
            {item.card.image ? (
              <Image
                source={{ uri: item.card.image }}
                style={styles.cardThumb}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.cardThumb, styles.cardThumbPlaceholder]} />
            )}
            <View style={styles.cardInfo}>
              <Text style={styles.cardName} numberOfLines={1}>{item.card.name}</Text>
              <View style={styles.cardMeta}>
                {item.card.faction.map((f) => (
                  <Image key={f} source={FACTION_IMAGES[f]} style={styles.factionIcon} />
                ))}
                <Text style={styles.cardType}>{item.card.type}</Text>
                <Text style={styles.cardCost}>◆ {item.card.cost}</Text>
              </View>
            </View>
            <Text style={styles.cardCount}>×{item.count}</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <>
            {/* Notes */}
            {deck.notes?.trim() ? (
              <View style={styles.notesSection}>
                <Text style={styles.sectionLabel}>NOTES</Text>
                <Text style={styles.notesText}>{deck.notes}</Text>
              </View>
            ) : null}

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
                style={styles.editButton}
                onPress={() => navigation.replace('DeckEditor', { deck })}
                activeOpacity={0.8}
              >
                <Text style={styles.editButtonText}>Edit Deck</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  seekerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  seekerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  seekerInfo: {
    flex: 1,
  },
  deckName: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  seekerName: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.gold,
    marginTop: 2,
  },
  seekerFaction: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.sm,
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  metaValue: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.purple,
  },
  countsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  countText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  countValid: {
    color: '#2A7A2A',
  },
  countWarn: {
    color: colors.danger,
  },
  breakdownText: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.textMuted,
  },
  sideCountText: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  costCurve: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  curveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
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
  sectionHeader: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardThumb: {
    width: 42,
    height: 54,
    backgroundColor: colors.surface,
  },
  cardThumbPlaceholder: {
    backgroundColor: colors.border,
  },
  cardInfo: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  cardName: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  cardMeta: {
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
  cardType: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.textMuted,
  },
  cardCost: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.purple,
    marginLeft: 'auto',
  },
  cardCount: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.gold,
    paddingRight: spacing.md,
  },
  notesSection: {
    marginTop: spacing.md,
  },
  notesText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
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
  editButton: {
    flex: 1,
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editButtonText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.background,
    letterSpacing: 1,
  },
});
