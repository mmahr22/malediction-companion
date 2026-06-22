import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface HuskWidgetProps {
  value: number;
  max: number;
  onChange: (amount: number) => void;
}

export function HuskWidget({ value, max, onChange }: HuskWidgetProps) {
  const toggle = (index: number) => {
    const isFilled = index < value;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isFilled) {
      onChange(-(value - index));
    } else {
      onChange(index + 1 - value);
    }
  };

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="skull" size={12} color={colors.gold} />
      <View style={styles.tokens}>
        {Array.from({ length: max }, (_, i) => {
          const filled = i < value;
          return (
            <TouchableOpacity
              key={i}
              style={[styles.token, filled && styles.tokenFilled]}
              onPress={() => toggle(i)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="skull"
                size={18}
                color={filled ? colors.gold : 'rgba(212,175,55,0.25)'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
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
  tokens: {
    flexDirection: 'row',
    gap: 2,
  },
  token: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  tokenFilled: {
    backgroundColor: 'rgba(212,175,55,0.25)',
    borderColor: colors.gold,
  },
});
