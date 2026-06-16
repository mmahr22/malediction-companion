import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';
import { colors, fonts, spacing } from '../theme/theme';

export function RoundBar() {
  const round = useGameStore((s) => s.round);
  const incrementRound = useGameStore((s) => s.incrementRound);
  const resetGame = useGameStore((s) => s.resetGame);

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    incrementRound();
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
        <MaterialCommunityIcons name="reload" size={16} color={colors.danger} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.roundDisplay} onPress={handleIncrement} activeOpacity={0.7}>
        <Text style={styles.roundLabel}>Round</Text>
        <Text style={styles.roundNumber}>{round}</Text>
      </TouchableOpacity>

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
  roundDisplay: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 4,
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
    fontSize: 32,
    color: colors.gold,
    lineHeight: 38,
  },
});
