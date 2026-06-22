import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Player } from '../data/types';
import { FactionDots } from './FactionDots';
import { colors, fonts, spacing } from '../theme/theme';
import { EchoWidget } from './EchoWidget';
import { HuskWidget } from './HuskWidget';

// Per-player dark gradient pairs: [highlight, deep-dark]
export const PLAYER_GRADIENTS: [string, string][] = [
  ['#6b1520', '#0d0305'],  // blood crimson
  ['#1a3d6e', '#050e1c'],  // midnight navy
  ['#1d5c1d', '#051005'],  // forest dark
  ['#5c1a6b', '#130416'],  // deep violet
  ['#1a5c5c', '#041313'],  // dark teal
  ['#6b4012', '#1a0e05'],  // burnt amber
];

interface PlayerPanelProps {
  player: Player;
  colorIndex: number;
  rotation: 0 | 90 | 180 | 270;
  onAdjustMastery: (amount: number) => void;
  onAdjustEcho: (amount: number) => void;
  onAdjustHusks: (amount: number) => void;
  onClaimVictory?: () => void;
  hasInitiative: boolean;
  onClaimInitiative: () => void;
}

export function PlayerPanel({
  player,
  colorIndex,
  rotation,
  onAdjustMastery,
  onAdjustEcho,
  onAdjustHusks,
  onClaimVictory,
  hasInitiative,
  onClaimInitiative,
}: PlayerPanelProps) {
  const masteryScale = useRef(new Animated.Value(1)).current;
  const masteryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const masteryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const masteryIsRepeatingRef = useRef(false);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(masteryScale, { toValue: 1.12, useNativeDriver: false, speed: 30, bounciness: 4 }),
      Animated.spring(masteryScale, { toValue: 1, useNativeDriver: false, speed: 30, bounciness: 0 }),
    ]).start();
  }, [player.mastery]);

  useEffect(() => {
    return () => {
      if (masteryTimeoutRef.current) clearTimeout(masteryTimeoutRef.current);
      if (masteryIntervalRef.current) clearInterval(masteryIntervalRef.current);
    };
  }, []);

  // React Native transforms touch coordinates along with the visual rotation,
  // so top always increments and bottom always decrements for every panel.
  const topAction = 1;
  const bottomAction = -1;

  const echoPosition = { bottom: spacing.sm, left: spacing.lg, right: spacing.lg };

  const handleMastery = (amount: number) => {
    Haptics.impactAsync(Math.abs(amount) >= 10 ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
    onAdjustMastery(amount);
  };

  const startMastery = (amount: number) => {
    masteryTimeoutRef.current = setTimeout(() => {
      masteryIsRepeatingRef.current = true;
      handleMastery(amount);
      masteryTimeoutRef.current = setTimeout(() => {
        handleMastery(amount);
        masteryTimeoutRef.current = setTimeout(() => {
          masteryIntervalRef.current = setInterval(() => handleMastery(amount), 150);
        }, 300);
      }, 300);
    }, 400);
  };

  const stopMastery = () => {
    if (masteryTimeoutRef.current) clearTimeout(masteryTimeoutRef.current);
    if (masteryIntervalRef.current) clearInterval(masteryIntervalRef.current);
    masteryTimeoutRef.current = null;
    masteryIntervalRef.current = null;
    // onPressOut fires before onPress — defer reset so onPress can still read the flag
    setTimeout(() => { masteryIsRepeatingRef.current = false; }, 0);
  };

  return (
    <View style={[styles.panel, { transform: [{ rotate: `${rotation}deg` }] }]}>
      {player.seeker?.image && (
        <Image
          source={player.seeker.image}
          style={styles.seekerBackground}
          resizeMode="cover"
        />
      )}

      {/* Dark scrim for legibility */}
      <View style={styles.scrim} />

      {/* Top tap zone */}
      <TouchableOpacity
        style={styles.tapZone}
        onPress={() => { if (!masteryIsRepeatingRef.current) handleMastery(topAction); }}
        onPressIn={() => startMastery(topAction * 10)}
        onPressOut={stopMastery}
        activeOpacity={0.6}
      >
        <Text style={styles.tapHint}>{topAction > 0 ? '+' : '−'}</Text>
      </TouchableOpacity>

      {/* Bottom tap zone */}
      <TouchableOpacity
        style={styles.tapZone}
        onPress={() => { if (!masteryIsRepeatingRef.current) handleMastery(bottomAction); }}
        onPressIn={() => startMastery(bottomAction * 10)}
        onPressOut={stopMastery}
        activeOpacity={0.6}
      >
        <Text style={styles.tapHint}>{bottomAction > 0 ? '+' : '−'}</Text>
      </TouchableOpacity>

      {/* Name header — pinned to top of panel */}
      <View style={styles.nameHeader} pointerEvents="box-none">
        <View style={styles.nameRow}>
          <View style={styles.playerNameBadge}>
            <Text style={styles.playerName}>{player.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.initiativeIcon, hasInitiative && styles.initiativeIconActive]}
            onPress={onClaimInitiative}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="sword-cross"
              size={16}
              color={hasInitiative ? colors.gold : 'rgba(255,255,255,0.4)'}
            />
          </TouchableOpacity>
        </View>
        {player.seeker && (
          <View style={styles.seekerRow}>
            <Text style={styles.seekerName}>{player.seeker.name}</Text>
            <Text style={styles.seekerDot}> · </Text>
            <FactionDots faction={player.seeker.faction} size={8} />
          </View>
        )}
      </View>

      {/* Center overlay — mastery number only */}
      <View style={styles.centerOverlay} pointerEvents="none">
        <Animated.Text style={[styles.masteryValue, { transform: [{ scale: masteryScale }] }]}>
          {player.mastery}
        </Animated.Text>
      </View>

      {/* Claim victory button — appears once mastery goal is met */}
      {onClaimVictory && (
        <View style={styles.claimOverlay} pointerEvents="box-none">
          <TouchableOpacity style={styles.claimBtn} onPress={onClaimVictory}>
            <Text style={styles.claimBtnText}>CLAIM VICTORY</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Husk widget — top-right corner */}
      <View style={styles.huskOverlay} pointerEvents="box-none">
        <HuskWidget value={player.husks} onChange={onAdjustHusks} />
      </View>

      {/* Echo widget — bottom center */}
      <View style={[styles.echoOverlay, echoPosition]} pointerEvents="box-none">
        <EchoWidget value={player.echo} onChange={onAdjustEcho} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
  },
  seekerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  tapZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapHint: {
    fontFamily: fonts.heading,
    fontSize: 28,
    color: 'rgba(255,255,255,0.30)',
  },
  nameHeader: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    alignItems: 'flex-start',
    gap: 2,
  },
  claimOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 52,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  initiativeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  initiativeIconActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,175,55,0.2)',
  },
  claimBtn: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(212,175,55,0.2)',
  },
  claimBtnText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 2,
  },
  huskOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masteryValue: {
    fontFamily: fonts.heading,
    fontSize: 96,
    color: colors.gold,
    lineHeight: 110,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  playerNameBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 4,
  },
  playerName: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textPrimary,
  },
  echoOverlay: {
    position: 'absolute',
  },
  seekerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  seekerName: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  seekerDot: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.border,
  },
});
