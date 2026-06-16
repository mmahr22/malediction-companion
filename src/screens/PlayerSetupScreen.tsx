import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { Seeker } from '../data/types';
import { SeekerPickerModal } from '../components/SeekerPickerModal';
import { FactionDots } from '../components/FactionDots';
import { colors, fonts, radius, spacing } from '../theme/theme';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

const MASTERY_PRESETS = [
  { value: 25, label: '25' },
  { value: 45, label: '45' },
  { value: 50, label: '50' },
  { value: 55, label: '55' },
  { value: 60, label: '60' },
];

interface PlayerEntry {
  name: string;
  seeker: Seeker | null;
}

function defaultEntries(count: number): PlayerEntry[] {
  return Array.from({ length: count }, () => ({ name: '', seeker: null }));
}

export function PlayerSetupScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const [playerCount, setPlayerCount] = useState(2);
  const [entries, setEntries] = useState<PlayerEntry[]>(defaultEntries(2));
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [masteryGoal, setMasteryGoal] = useState(45);

  const setPlayerCountAndResize = (count: number) => {
    setPlayerCount(count);
    setEntries((prev) => {
      const next = [...prev];
      while (next.length < count) next.push({ name: '', seeker: null });
      return next.slice(0, count);
    });
  };

  const updateName = (index: number, name: string) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, name } : e)));
  };

  const assignSeeker = (index: number, seeker: Seeker) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, seeker } : e)));
  };

  const handleBegin = () => {
    startGame(entries.map(({ name, seeker }) => ({ name, seeker })), masteryGoal);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Step into the Malediction</Text>
        <Text style={styles.subtitle}>Malediction</Text>

        <Text style={styles.label}>Players</Text>
        <View style={styles.row}>
          {Array.from({ length: MAX_PLAYERS - MIN_PLAYERS + 1 }, (_, i) => MIN_PLAYERS + i).map((count) => (
            <TouchableOpacity
              key={count}
              style={[styles.countButton, playerCount === count && styles.countButtonActive]}
              onPress={() => setPlayerCountAndResize(count)}
            >
              <Text style={[styles.countButtonText, playerCount === count && styles.countButtonTextActive]}>
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Player Names &amp; Seekers</Text>
        {entries.map((entry, i) => (
          <View key={i} style={styles.playerBlock}>
            <TextInput
              style={styles.input}
              placeholder={`Player ${i + 1}`}
              placeholderTextColor={colors.textMuted}
              value={entry.name}
              onChangeText={(text) => updateName(i, text)}
            />
            <TouchableOpacity
              style={[styles.seekerButton, entry.seeker && styles.seekerButtonChosen]}
              onPress={() => setPickerIndex(i)}
              activeOpacity={0.75}
            >
              {entry.seeker ? (
                <View style={styles.seekerButtonContent}>
                  <Text style={styles.seekerButtonName}>{entry.seeker.name}</Text>
                  <FactionDots faction={entry.seeker.faction} size={10} />
                </View>
              ) : (
                <Text style={styles.seekerButtonPlaceholder}>Choose Seeker</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.label}>Mastery Goal</Text>
        <View style={styles.row}>
          {MASTERY_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.value}
              style={[styles.masteryButton, masteryGoal === preset.value && styles.masteryButtonActive]}
              onPress={() => setMasteryGoal(preset.value)}
            >
              <Text style={[styles.masteryButtonValue, masteryGoal === preset.value && styles.masteryButtonValueActive]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleBegin}>
          <Text style={styles.startButtonText}>Begin</Text>
        </TouchableOpacity>
      </ScrollView>

      <SeekerPickerModal
        visible={pickerIndex !== null}
        selectedId={pickerIndex !== null ? (entries[pickerIndex]?.seeker?.id ?? null) : null}
        onSelect={(seeker) => {
          if (pickerIndex !== null) assignSeeker(pickerIndex, seeker);
        }}
        onClose={() => setPickerIndex(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.display,
    color: colors.gold,
    marginTop: 32,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fonts.heading,
    color: colors.textMuted,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.heading,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  countButtonActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,175,55,0.15)',
  },
  countButtonText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textMuted,
  },
  countButtonTextActive: {
    color: colors.gold,
  },
  playerBlock: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
  },
  seekerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
  },
  seekerButtonChosen: {
    borderColor: colors.gold,
  },
  seekerButtonContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  seekerButtonName: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.textPrimary,
  },
  seekerButtonPlaceholder: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  masteryButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  masteryButtonActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,175,55,0.15)',
  },
  masteryButtonValue: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textMuted,
  },
  masteryButtonValueActive: {
    color: colors.gold,
  },
  startButton: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  startButtonText: {
    color: colors.gold,
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: 4,
  },
});
