import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { CardsStackParamList } from '../navigation/types';
import { FACTION_COLORS, FACTION_IMAGES } from '../theme/factions';
import { Card } from '../data/types';
import { colors, fonts, spacing } from '../theme/theme';

type DetailRoute = RouteProp<CardsStackParamList, 'CardDetail'>;

const RANK_COLORS: Record<Card['rank'], string> = {
  Basic: colors.textMuted,
  Elite: colors.purple,
  Unique: '#E67E22',
  Legendary: colors.gold,
};

function StatRow({ label, sublabel, value }: { label: string; sublabel?: string; value: string | number }) {
  return (
    <View style={styles.statRow}>
      <View>
        <Text style={styles.statLabel}>{label}</Text>
        {sublabel ? <Text style={styles.statSublabel}>{sublabel}</Text> : null}
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function CardDetailScreen() {
  const { params } = useRoute<DetailRoute>();
  const { card } = params;
  const rankColor = RANK_COLORS[card.rank];
  const hasStats = card.type === 'Unit' && card.accuracy !== undefined;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView>
        {/* ── Hero row ── */}
        <View style={styles.hero}>
          {/* Left: card image */}
          <View style={styles.imageColumn}>
            {card.image ? (
              <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="contain" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderGlyph}>?</Text>
              </View>
            )}
          </View>

          {/* Right: info + stats */}
          <View style={styles.infoColumn}>
            {/* Name + rank */}
            <View style={styles.nameRow}>
              <Text style={styles.name}>{card.name}</Text>
              <Text style={[styles.rankBadge, { color: rankColor }]}>{card.rank.toUpperCase()}</Text>
            </View>

            {/* Faction badges */}
            <View style={styles.factionRow}>
              {card.faction.map((f) => (
                <View key={f} style={[styles.factionBadge, { borderColor: FACTION_COLORS[f] ?? colors.border }]}>
                  <Image source={FACTION_IMAGES[f]} style={styles.factionIcon} />
                  <Text style={[styles.factionText, { color: FACTION_COLORS[f] ?? colors.textMuted }]} numberOfLines={1}>
                    {f.split(' ').slice(-1)[0]}
                  </Text>
                </View>
              ))}
            </View>

            {/* Traits */}
            <Text style={styles.traits}>{card.traits.join(' ◆ ')}</Text>

            {/* Stat table */}
            <View style={styles.statsTable}>
              <StatRow label="Echo Cost" value={card.cost} />
              {hasStats && (
                <>
                  <StatRow label="Accuracy" value={card.accuracy!} />
                  <StatRow label="Power" sublabel="Hit / Graze" value={`${card.powerHit} / ${card.powerGraze}`} />
                  <StatRow label="Range" value={card.range ?? 0} />
                  <StatRow label="Speed" value={card.speed ?? 0} />
                  <StatRow label="Defense" value={card.defense ?? 0} />
                  <StatRow label="Max Health" value={card.maxHealth ?? 0} />
                  {card.baseSize ? <StatRow label="Base" value={card.baseSize} /> : null}
                </>
              )}
            </View>
          </View>
        </View>

        {/* ── Abilities — full width ── */}
        {card.abilities.length > 0 ? (
          <View style={styles.abilitiesSection}>
            <Text style={styles.sectionLabel}>Rules Text</Text>
            {card.abilities.map((a, i) => (
              <View key={i} style={[styles.ability, i > 0 && styles.abilityDivider]}>
                {a.name ? <Text style={styles.abilityName}>{a.name}</Text> : null}
                <Text style={styles.abilityText}>{a.text}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.pendingSection}>
            <Text style={styles.pendingText}>Full card data coming soon</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Hero
  hero: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  imageColumn: {
    width: '40%',
    aspectRatio: 5 / 7,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderGlyph: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.border,
  },
  infoColumn: {
    flex: 1,
    padding: spacing.md,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  name: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  rankBadge: {
    fontFamily: fonts.heading,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 3,
  },
  factionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  factionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  factionIcon: {
    width: 11,
    height: 11,
    resizeMode: 'contain',
  },
  factionText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  traits: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  statsTable: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}50`,
  },
  statLabel: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  statSublabel: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: `${colors.textMuted}80`,
    letterSpacing: 0.3,
    marginTop: 1,
  },
  statValue: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.textPrimary,
  },

  // Abilities
  abilitiesSection: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  ability: {
    gap: 4,
  },
  abilityDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  abilityName: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  abilityText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },

  // Pending
  pendingSection: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  pendingText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.border,
    letterSpacing: 2,
  },
});
