import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface CounterControlProps {
  label: string;
  value: number;
  accentColor: string;
  onChange: (amount: number) => void;
}

export function CounterControl({ label, value, accentColor, onChange }: CounterControlProps) {
  const [customAmount, setCustomAmount] = useState('');
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.18, useNativeDriver: true, speed: 40, bounciness: 6 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 0 }),
    ]).start();
  }, [value]);

  const handleChange = (amount: number, impact: Haptics.ImpactFeedbackStyle) => {
    Haptics.impactAsync(impact);
    onChange(amount);
  };

  const applyCustom = (sign: 1 | -1) => {
    const amount = parseInt(customAmount, 10);
    if (!isNaN(amount) && amount > 0) {
      handleChange(amount * sign, Haptics.ImpactFeedbackStyle.Light);
    }
    setCustomAmount('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Animated.Text style={[styles.value, { color: accentColor, transform: [{ scale }] }]}>
          {value}
        </Animated.Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { borderColor: accentColor }]}
          onPress={() => handleChange(-5, Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>-5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { borderColor: accentColor }]}
          onPress={() => handleChange(-1, Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>-1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { borderColor: accentColor }]}
          onPress={() => handleChange(1, Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>+1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { borderColor: accentColor }]}
          onPress={() => handleChange(5, Haptics.ImpactFeedbackStyle.Medium)}
        >
          <Text style={[styles.buttonText, { color: accentColor }]}>+5</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customRow}>
        <TextInput
          style={[styles.input, { borderColor: colors.border }]}
          placeholder="Custom"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={customAmount}
          onChangeText={setCustomAmount}
        />
        <TouchableOpacity style={[styles.customButton, { borderColor: accentColor }]} onPress={() => applyCustom(-1)}>
          <Text style={[styles.buttonText, { color: accentColor }]}>−</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.customButton, { borderColor: accentColor }]} onPress={() => applyCustom(1)}>
          <Text style={[styles.buttonText, { color: accentColor }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 12,
    fontFamily: fonts.heading,
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 36,
    fontFamily: fonts.heading,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: fonts.heading,
  },
  customRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    fontFamily: fonts.heading,
  },
  customButton: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    backgroundColor: colors.surface,
  },
});
