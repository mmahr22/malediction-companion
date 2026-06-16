import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { CardsStackParamList } from '../navigation/types';
import { colors, fonts, radius, spacing } from '../theme/theme';

type DetailRoute = RouteProp<CardsStackParamList, 'CardDetail'>;

export function CardDetailScreen() {
  const { params } = useRoute<DetailRoute>();
  const { card } = params;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.card}>
        <Text style={styles.name}>{card.name}</Text>
        <Text style={styles.meta}>
          {card.faction} · {card.type} · Cost {card.cost}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.description}>{card.description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  name: {
    fontSize: 22,
    fontFamily: fonts.heading,
    color: colors.gold,
    letterSpacing: 1,
  },
  meta: {
    fontSize: 12,
    fontFamily: fonts.heading,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  description: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
});
