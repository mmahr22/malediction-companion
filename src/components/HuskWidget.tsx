import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface HuskWidgetProps {
  value: number;
  onChange: (amount: number) => void;
}

export function HuskWidget({ value, onChange }: HuskWidgetProps) {
  const handle = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(amount);
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="skull" size={9} color={colors.gold} />
      <Text style={styles.label}> HUSKS</Text>
      <TouchableOpacity style={styles.btn} onPress={() => handle(-1)}>
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity style={styles.btn} onPress={() => handle(1)}>
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: colors.gold,
    letterSpacing: 1.5,
  },
  btn: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212,175,55,0.15)',
  },
  btnText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.gold,
    lineHeight: 14,
  },
  value: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.gold,
    minWidth: 16,
    textAlign: 'center',
  },
});
