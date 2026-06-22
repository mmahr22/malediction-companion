import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useGameStore } from '../store/gameStore';
import { useHistoryStore } from '../store/historyStore';
import { Player } from '../data/types';
import { PlayerPanel } from '../components/PlayerPanel';
import { RoundBar } from '../components/RoundBar';
import { PlayerSetupScreen } from './PlayerSetupScreen';
import { useKeepAwake } from 'expo-keep-awake';
import { colors, fonts, spacing, radius } from '../theme/theme';

type Rotation = 0 | 90 | 180 | 270;
type LayoutCell = { player: Player; rotation: Rotation };
type LayoutRow = { cells: LayoutCell[]; flex?: number };

function buildLayout(players: Player[]): LayoutRow[] {
  const [p1, p2, p3, p4, p5, p6] = players;
  switch (players.length) {
    case 1:
      return [
        { cells: [], flex: 0 },
        { cells: [{ player: p1, rotation: 0 }] },
      ];
    case 2:
      return [
        { cells: [{ player: p2, rotation: 180 }] },
        { cells: [{ player: p1, rotation: 0 }] },
      ];
    case 3:
      return [
        { cells: [{ player: p3, rotation: 180 }] },
        { cells: [{ player: p1, rotation: 0 }, { player: p2, rotation: 0 }] },
      ];
    case 4:
      return [
        { cells: [{ player: p4, rotation: 180 }, { player: p3, rotation: 180 }] },
        { cells: [{ player: p1, rotation: 0 }, { player: p2, rotation: 0 }] },
      ];
    case 5:
      return [
        { cells: [{ player: p5, rotation: 180 }, { player: p4, rotation: 180 }] },
        { cells: [{ player: p3, rotation: 0 }, { player: p2, rotation: 0 }, { player: p1, rotation: 0 }] },
      ];
    case 6:
      return [
        { cells: [{ player: p6, rotation: 180 }, { player: p5, rotation: 180 }, { player: p4, rotation: 180 }] },
        { cells: [{ player: p1, rotation: 0 }, { player: p2, rotation: 0 }, { player: p3, rotation: 0 }] },
      ];
    default:
      return [{ cells: players.map((p) => ({ player: p, rotation: 0 as Rotation })) }];
  }
}

export function GameTrackerScreen() {
  const navigation = useNavigation();
  const players = useGameStore((s) => s.players);
  const isActive = useGameStore((s) => s.isActive);
  const masteryGoal = useGameStore((s) => s.masteryGoal);
  const round = useGameStore((s) => s.round);
  const adjustMastery = useGameStore((s) => s.adjustMastery);
  const adjustEcho = useGameStore((s) => s.adjustEcho);
  const adjustHusks = useGameStore((s) => s.adjustHusks);
  const initiativePlayerId = useGameStore((s) => s.initiativePlayerId);
  const claimInitiative = useGameStore((s) => s.claimInitiative);
  const resetGame = useGameStore((s) => s.resetGame);

  useKeepAwake();

  const addRecord = useHistoryStore((s) => s.addRecord);
  const [winner, setWinner] = useState<{ name: string; mastery: number } | null>(null);
  const [echoToast, setEchoToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const prevRound = useRef(round);

  useEffect(() => {
    if (!isActive) setWinner(null);
  }, [isActive]);

  useEffect(() => {
    if (round > prevRound.current && isActive) {
      const gain = Math.min(round, 5) * 2;
      setEchoToast(`+${gain} Echo`);
      toastOpacity.setValue(1);
      Animated.timing(toastOpacity, { toValue: 0, duration: 2000, useNativeDriver: true }).start(() => {
        setEchoToast(null);
      });
    }
    prevRound.current = round;
  }, [round]);

  const handleClaimVictory = (player: Player) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setWinner({ name: player.name, mastery: player.mastery });
    addRecord({
      masteryGoal,
      rounds: round,
      players: players.map((p) => ({
        name: p.name,
        seekerName: p.seeker?.name ?? null,
        finalMastery: p.mastery,
        husks: p.husks,
        isWinner: p.id === player.id,
        profileId: p.profileId ?? undefined,
      })),
    });
  };

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isActive
        ? { display: 'none' }
        : { backgroundColor: colors.surface, borderTopColor: colors.border },
    });
  }, [isActive, navigation]);

  useEffect(() => {
    if (isActive && players.length > 2) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [isActive, players.length]);

  if (!isActive) {
    return <PlayerSetupScreen />;
  }

  const rows = buildLayout(players);
  const colorOf = (p: Player) => players.indexOf(p);
  const maxHusks = masteryGoal === 25 ? 2 : 4;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.panels}>
        {rows.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {rowIndex > 0 && <RoundBar />}
            <View style={[styles.row, { flex: row.flex ?? 1 }]}>
              {row.cells.map(({ player, rotation }) => (
                <PlayerPanel
                  key={player.id}
                  player={player}
                  colorIndex={colorOf(player)}
                  rotation={rotation}
                  onAdjustMastery={(amount) => adjustMastery(player.id, amount)}
                  onAdjustEcho={(amount) => adjustEcho(player.id, amount)}
                  onAdjustHusks={(amount) => adjustHusks(player.id, amount)}
                  maxHusks={maxHusks}
                  onClaimVictory={player.mastery >= masteryGoal ? () => handleClaimVictory(player) : undefined}
                  hasInitiative={initiativePlayerId === player.id}
                  onClaimInitiative={() => claimInitiative(player.id)}
                  masteryGoal={masteryGoal}
                />
              ))}
            </View>
          </React.Fragment>
        ))}
      </View>

      {echoToast && (
        <Animated.View style={[styles.echoToast, { opacity: toastOpacity }]} pointerEvents="none">
          <Text style={styles.echoToastText}>{echoToast}</Text>
        </Animated.View>
      )}

      {winner && (
        <View style={styles.winOverlay}>
          <Text style={styles.winLabel}>Victory</Text>
          <Text style={styles.winName}>{winner.name}</Text>
          <Text style={styles.winScore}>{winner.mastery} Mastery</Text>
          <TouchableOpacity style={styles.newGameBtn} onPress={resetGame}>
            <Text style={styles.newGameText}>New Game</Text>
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
  panels: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  winOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,7,16,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  winLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.textMuted,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  winName: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: colors.gold,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  winScore: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textMuted,
    letterSpacing: 2,
  },
  newGameBtn: {
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl * 2,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  newGameText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.gold,
    letterSpacing: 3,
  },
  echoToast: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  echoToastText: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.purple,
    letterSpacing: 2,
  },
});
