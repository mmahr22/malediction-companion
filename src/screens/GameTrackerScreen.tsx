import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useGameStore } from '../store/gameStore';
import { Player } from '../data/types';
import { PlayerPanel } from '../components/PlayerPanel';
import { RoundBar } from '../components/RoundBar';
import { PlayerSetupScreen } from './PlayerSetupScreen';
import { colors } from '../theme/theme';

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
    // 4-player: simple 2×2 grid, top row rotated 180°, bottom row normal.
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
  const players = useGameStore((s) => s.players);
  const isActive = useGameStore((s) => s.isActive);
  const adjustMastery = useGameStore((s) => s.adjustMastery);
  const adjustEcho = useGameStore((s) => s.adjustEcho);

  useEffect(() => {
    if (isActive) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [isActive]);

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
                />
              ))}
            </View>
          </React.Fragment>
        ))}
      </View>
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
});
