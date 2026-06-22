import React, { useState, useEffect, useRef } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useGameStore } from '../store/gameStore';
import { useHistoryStore } from '../store/historyStore';
import { colors, fonts, spacing } from '../theme/theme';

export function RoundBar() {
  const round = useGameStore((s) => s.round);
  const players = useGameStore((s) => s.players);
  const masteryGoal = useGameStore((s) => s.masteryGoal);
  const incrementRound = useGameStore((s) => s.incrementRound);
  const resetGame = useGameStore((s) => s.resetGame);
  const undo = useGameStore((s) => s.undo);
  const canUndo = useGameStore((s) => s.undoStack.length > 0);
  const addRecord = useHistoryStore((s) => s.addRecord);

  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState('00:00');
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTime.current) / 1000);
      const m = String(Math.floor(diff / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      setElapsed(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleIncrement = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    incrementRound();
  };

  const recordAndReset = () => {
    addRecord({
      masteryGoal,
      rounds: round,
      players: players.map((p) => ({
        name: p.name,
        seekerName: p.seeker?.name ?? null,
        finalMastery: p.mastery,
        husks: p.husks,
        isWinner: false,
        profileId: p.profileId ?? undefined,
      })),
    });
    resetGame();
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (Platform.OS === 'web') {
      if (window.confirm('End the current game and clear all scores?')) recordAndReset();
    } else {
      Alert.alert('End Game', 'End the current game and clear all scores?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Game', style: 'destructive', onPress: recordAndReset },
      ]);
    }
  };

  return (
    <View style={styles.bar}>
      <TouchableOpacity style={styles.endButton} onPress={handleReset}>
        <MaterialCommunityIcons name="reload" size={16} color={colors.danger} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.endButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); undo(); }} disabled={!canUndo}>
        <MaterialCommunityIcons name="undo" size={16} color={canUndo ? colors.textMuted : colors.border} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.roundDisplay} onPress={handleIncrement} activeOpacity={0.7}>
        <Text style={styles.roundLabel}>Round</Text>
        <Text style={styles.roundNumber}>{round}</Text>
      </TouchableOpacity>

      <View style={styles.endButton}>
        <Text style={styles.timer}>{elapsed}</Text>
      </View>
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
  timer: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
});
