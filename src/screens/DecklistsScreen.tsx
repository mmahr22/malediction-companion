import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Deck } from '../data/types';
import { getItem, StorageKeys } from '../storage/storage';
import { colors, fonts, radius, spacing } from '../theme/theme';

export function DecklistsScreen() {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    getItem<Deck[]>(StorageKeys.DECKS).then((stored) => setDecks(stored ?? []));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Text style={styles.deckName}>{item.name}</Text>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No decks yet. Deck building unlocks once the card database is ready.</Text>
        }
      />
      <TouchableOpacity style={styles.createButton} disabled>
        <Text style={styles.createButtonText}>Create Deck — Coming Soon</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  list: {
    flexGrow: 1,
  },
  deckName: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.heading,
    marginTop: 40,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    opacity: 0.5,
  },
  createButtonText: {
    color: colors.textMuted,
    fontFamily: fonts.heading,
    fontSize: 14,
    letterSpacing: 1,
  },
});
