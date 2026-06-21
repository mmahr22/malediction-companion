import React, { useReducer, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { FACTION_COLORS, FACTION_IMAGES } from '../theme/factions';
import { Card } from '../data/types';
import { activeBridge } from '../store/deckEditorBridge';
import { colors, fonts, spacing } from '../theme/theme';

type DetailRoute = RouteProp<{ CardDetail: { card: Card } }, 'CardDetail'>;

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
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const bridge = activeBridge;
  const inDeck = bridge ? bridge.getCount(card.id) : 0;
  const limit = bridge ? bridge.getLimit(card) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* ── Lightbox modal ── */}
      {card.image ? (
        <Modal
          visible={lightboxVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLightboxVisible(false)}
        >
          <Pressable style={styles.lightboxBackdrop} onPress={() => setLightboxVisible(false)}>
            <Image
              source={{ uri: card.image }}
              style={styles.lightboxImage}
              resizeMode="contain"
            />
          </Pressable>
        </Modal>
      ) : null}

      <ScrollView>
        {/* ── Hero row ── */}
        <View style={styles.hero}>
          {/* Left: card image */}
          <View style={styles.imageColumn}>
            {card.image ? (
              <Pressable onPress={() => setLightboxVisible(true)} style={{ flex: 1 }}>
                <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="contain" />
              </Pressable>
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
                  <Text style={[styles.factionText, { color: FACTION_COLORS[f] ?? colors.textMuted }]}>
                    {f}
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

      {bridge && (
        <View style={styles.deckBar}>
          <TouchableOpacity
            style={styles.deckBarBtn}
            onPress={() => { bridge.removeCard(card); forceUpdate(); }}
            disabled={inDeck <= 0}
          >
            <Text style={[styles.deckBarBtnText, inDeck <= 0 && styles.deckBarBtnDisabled]}>−</Text>
          </TouchableOpacity>
          <Text style={styles.deckBarCount}>{inDeck} / {limit}</Text>
          <TouchableOpacity
            style={styles.deckBarBtn}
            onPress={() => { bridge.addCard(card); forceUpdate(); }}
            disabled={inDeck >= limit}
          >
            <Text style={[styles.deckBarBtnText, inDeck >= limit && styles.deckBarBtnDisabled]}>+</Text>
          </TouchableOpacity>
        </View>
      )}
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
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: {
    width: '90%',
    height: '90%',
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
    flexShrink: 1,
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

  // Deck builder bar
  deckBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  deckBarBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckBarBtnText: {
    fontFamily: fonts.heading,
    fontSize: 24,
    color: colors.gold,
  },
  deckBarBtnDisabled: {
    color: colors.border,
  },
  deckBarCount: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
    minWidth: 50,
    textAlign: 'center',
  },
});
