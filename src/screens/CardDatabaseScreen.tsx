import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cards } from '../data/cards';
import { Card } from '../data/types';
import { CardsStackParamList } from '../navigation/types';
import { FACTION_IMAGES } from '../theme/factions';
import { colors, fonts, radius, spacing } from '../theme/theme';

type Navigation = NativeStackNavigationProp<CardsStackParamList, 'CardDatabase'>;

const TYPES: Card['type'][] = ['Unit', 'Spell', 'Attachment', 'Legacy', 'Terrain'];
const RANKS: Card['rank'][] = ['Basic', 'Elite', 'Unique', 'Legendary'];
const TRAITS = ['Seeker', 'Channel', 'Swift', 'Item', 'Relic'];
const RANK_COLORS: Record<Card['rank'], string> = {
  Basic: colors.textMuted,
  Elite: colors.purple,
  Unique: '#E67E22',
  Legendary: colors.gold,
};

function FilterPill({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
}) {
  const activeColor = color ?? colors.gold;
  return (
    <TouchableOpacity
      style={[styles.pill, active && { borderColor: activeColor, backgroundColor: `${activeColor}20` }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.pillText, active && { color: activeColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function CardRow({ card, onPress }: { card: Card; onPress: () => void }) {
  const rankColor = RANK_COLORS[card.rank];
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}>
      {card.image ? (
        <Image source={{ uri: card.image }} style={[styles.thumb, styles.thumbBg]} resizeMode="contain" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]} />
      )}
      <View style={styles.rowInfo}>
        <View style={styles.rowTop}>
          <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
          <Text style={[styles.rankBadge, { color: rankColor }]}>{card.rank}</Text>
        </View>
        <View style={styles.rowMeta}>
          {card.faction.map((f) => (
            <Image key={f} source={FACTION_IMAGES[f]} style={styles.factionIcon} />
          ))}
          <Text style={styles.metaText}>{card.type}</Text>
          {card.traits.length > 0 && (
            <Text style={styles.metaText}>· {card.traits.join(', ')}</Text>
          )}
          <Text style={[styles.costBadge]}>◆ {card.cost}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function CardDatabaseScreen() {
  const navigation = useNavigation<Navigation>();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<Card['type'] | null>(null);
  const [rank, setRank] = useState<Card['rank'] | null>(null);
  const [trait, setTrait] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.traits.some((t) => t.toLowerCase().includes(q))) return false;
      if (type && c.type !== type) return false;
      if (rank && c.rank !== rank) return false;
      if (trait && !c.traits.includes(trait)) return false;
      return true;
    });
  }, [query, type, rank, trait]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TextInput
        style={styles.search}
        placeholder="Search by name or trait..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />

      {/* Type filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>TYPE</Text>
        <View style={styles.pillRow}>
          {TYPES.map((t) => (
            <FilterPill
              key={t}
              label={t}
              active={type === t}
              onPress={() => setType(type === t ? null : t)}
            />
          ))}
        </View>
      </View>

      {/* Rarity filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>RARITY</Text>
        <View style={styles.pillRow}>
          {RANKS.map((r) => (
            <FilterPill
              key={r}
              label={r}
              active={rank === r}
              color={RANK_COLORS[r]}
              onPress={() => setRank(rank === r ? null : r)}
            />
          ))}
        </View>
      </View>

      {/* Trait filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>TRAIT</Text>
        <View style={styles.pillRow}>
          {TRAITS.map((t) => (
            <FilterPill
              key={t}
              label={t}
              active={trait === t}
              onPress={() => setTrait(trait === t ? null : t)}
            />
          ))}
        </View>
      </View>

      <Text style={styles.count}>{filtered.length} card{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CardRow card={item} onPress={() => navigation.navigate('CardDetail', { card: item })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No cards match your filters.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
  },
  filterSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 2,
  },
  filterLabel: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  count: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
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
  },
  thumb: {
    width: 56,
    height: 72,
  },
  thumbBg: {
    backgroundColor: colors.surface,
  },
  thumbPlaceholder: {
    backgroundColor: colors.border,
  },
  rowInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  cardName: {
    flex: 1,
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  rankBadge: {
    fontFamily: fonts.heading,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  factionIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  metaText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  costBadge: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.purple,
    marginLeft: 'auto',
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.heading,
    marginTop: 40,
    letterSpacing: 1,
  },
});
