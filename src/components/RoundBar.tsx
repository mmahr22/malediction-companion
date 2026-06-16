import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';
import { colors, fonts, spacing } from '../theme/theme';

export function RoundBar() {
  const round = useGameStore((s) => s.round);
  const incrementRound = useGameStore((s) => s.incrementRound);
  const decrementRound = useGameStore((s) => s.decrementRound);
  const resetGame = useGameStore((s) => s.resetGame);

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    incrementRound();
  };

  const handleDecrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    decrementRound();
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('End Game', 'End the current game and clear all scores?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Game', style: 'destructive', onPress: resetGame },
    ]);
  };

  return (
    <View style={styles.bar}>
      <TouchableOpacity style={styles.endButton} onPress={handleReset}>
        <MaterialCommunityIcons name="skull-crossbones" size={16} color={colors.danger} />
      </TouchableOpacity>

      <View style={styles.roundControls}>
        <TouchableOpacity style={styles.roundBtn} onPress={handleDecrement}>
          <MaterialCommunityIcons name="minus" size={16} color={colors.gold} />
        </TouchableOpacity>
        <View style={styles.roundDisplay}>
          <Text style={styles.roundLabel}>Round</Text>
          <Text style={styles.roundNumber}>{round}</Text>
        </View>
        <TouchableOpacity style={styles.roundBtn} onPress={handleIncrement}>
          <MaterialCommunityIcons name="plus" size={16} color={colors.gold} />
        </TouchableOpacity>
      </View>

      {/* Spacer to balance the skull button */}
      <View style={styles.endButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors.border,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
  },
  endButton: {
    width: 40,
    alignItems: 'center',
  },
  roundControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roundBtn: {
    padding: 6,
  },
  roundDisplay: {
    alignItems: 'center',
    minWidth: 56,
  },
  roundLabel: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  roundNumber: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.gold,
    lineHeight: 22,
  },
});
