import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { sampleCards } from '../data/sampleCards';
import { CardsStackParamList } from '../navigation/types';
import { colors, fonts, radius, spacing } from '../theme/theme';

type Navigation = NativeStackNavigationProp<CardsStackParamList, 'CardDatabase'>;

export function CardDatabaseScreen() {
  const navigation = useNavigation<Navigation>();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sampleCards;
    return sampleCards.filter(
      (card) => card.name.toLowerCase().includes(q) || card.faction.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TextInput
        style={styles.search}
        placeholder="Search cards by name or faction..."
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('CardDetail', { card: item })}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.faction} · {item.type} · Cost {item.cost}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No cards found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardName: {
    fontSize: 16,
    fontFamily: fonts.heading,
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: fonts.heading,
    color: colors.textMuted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.heading,
    marginTop: 40,
  },
});
