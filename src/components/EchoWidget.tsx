import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface EchoWidgetProps {
  value: number;
  onChange: (amount: number) => void;
}

export function EchoWidget({ value, onChange }: EchoWidgetProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: false, speed: 40, bounciness: 6 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 40, bounciness: 0 }),
    ]).start();
  }, [value]);

  const handle = (amount: number) => {
    Haptics.impactAsync(amount % 10 === 0 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    onChange(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelGroup}>
        <MaterialCommunityIcons name="diamond-stone" size={9} color={colors.purple} />
        <Text style={styles.label}> ECHO</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={() => handle(-1)} onLongPress={() => handle(-10)}>
        <Text style={styles.btnText}>−</Text>
      </TouchableOpacity>
      <Animated.Text style={[styles.value, { transform: [{ scale }] }]}>{value}</Animated.Text>
      <TouchableOpacity style={styles.btn} onPress={() => handle(1)} onLongPress={() => handle(10)}>
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
    borderColor: colors.purple,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontFamily: fonts.heading,
    fontSize: 9,
    color: colors.purple,
    letterSpacing: 1.5,
  },
  btn: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,95,191,0.2)',
  },
  btnText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.purple,
    lineHeight: 14,
  },
  value: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.purple,
    minWidth: 28,
    textAlign: 'center',
  },
});
