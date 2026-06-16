import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Player } from '../data/types';
import { colors, fonts, radius, spacing } from '../theme/theme';
import { CounterControl } from './CounterControl';

interface PlayerCounterCardProps {
  player: Player;
  onAdjustMastery: (amount: number) => void;
  onAdjustEcho: (amount: number) => void;
}

export function PlayerCounterCard({ player, onAdjustMastery, onAdjustEcho }: PlayerCounterCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{player.name}</Text>

      <View style={styles.divider} />

      <View style={styles.statRow}>
        <MaterialCommunityIcons name="skull" size={16} color={colors.gold} />
        <CounterControl
          label="Mastery"
          value={player.mastery}
          accentColor={colors.gold}
          onChange={onAdjustMastery}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.statRow}>
        <MaterialCommunityIcons name="diamond-stone" size={16} color={colors.purple} />
        <CounterControl
          label="Echo"
          value={player.echo}
          accentColor={colors.purple}
          onChange={onAdjustEcho}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  name: {
    fontSize: 20,
    fontFamily: fonts.heading,
    color: colors.gold,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
});
