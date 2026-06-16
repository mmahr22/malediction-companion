import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useGameStore } from '../store/gameStore';
import { Player } from '../data/types';
import { PlayerPanel } from '../components/PlayerPanel';
import { RoundBar } from '../components/RoundBar';
import { PlayerSetupScreen } from './PlayerSetupScreen';
import { colors, fonts, spacing, radius } from '../theme/theme';

type Rotation = 0 | 90 | 180 | 270;
type LayoutCell = { player: Player; rotation: Rotation };
type LayoutRow = { cells: LayoutCell[]; flex?: number };

function buildLayout(players: Player[]): LayoutRow[] {
  const [p1, p2, p3, p4, p5, p6] = players;
  switch (players.length) {
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
  const adjustMastery = useGameStore((s) => s.adjustMastery);
  const adjustEcho = useGameStore((s) => s.adjustEcho);
  const adjustHusks = useGameStore((s) => s.adjustHusks);
  const resetGame = useGameStore((s) => s.resetGame);

  const winner = isActive ? players.find((p) => p.mastery >= masteryGoal) ?? null : null;

  useEffect(() => {
    if (winner) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [winner?.id]);

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
                />
              ))}
            </View>
          </React.Fragment>
        ))}
      </View>

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
});
