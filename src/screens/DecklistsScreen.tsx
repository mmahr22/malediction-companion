import React, { useEffect } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cards } from '../data/cards';
import { sampleSeekers } from '../data/sampleSeekers';
import { Deck } from '../data/types';
import { useDeckStore } from '../store/deckStore';
import { DecksStackParamList } from '../navigation/types';
import { colors, fonts, radius, spacing } from '../theme/theme';

type Navigation = NativeStackNavigationProp<DecksStackParamList, 'DeckList'>;

function countCards(deck: Record<string, number>): number {
  return Object.values(deck).reduce((sum, n) => sum + n, 0);
}

function DeckCard({ deck, onPress, onDelete }: { deck: Deck; onPress: () => void; onDelete: () => void }) {
  const seeker = sampleSeekers.find((s) => s.id === deck.seekerId);
  const mainCount = countCards(deck.mainDeck);
  const sideCount = countCards(deck.sideDeck);
  const isMainValid = mainCount >= 30 && mainCount <= 50;
  const terrain = deck.terrainId ? cards.find((c) => c.id === deck.terrainId) : null;

  const handleLongPress = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${deck.name}"?`)) onDelete();
    } else {
      Alert.alert('Delete Deck', `Delete "${deck.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]);
    }
  };

  return (
    <TouchableOpacity
      style={styles.deckCard}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.75}
    >
      <View style={styles.deckHeader}>
        {seeker?.image && (
          <Image source={seeker.image} style={styles.seekerThumb} />
        )}
        <View style={styles.deckHeaderInfo}>
          <Text style={styles.deckName} numberOfLines={1}>{deck.name}</Text>
          <Text style={styles.seekerName}>{seeker?.name ?? 'Unknown Seeker'}</Text>
        </View>
        <View style={[styles.validBadge, isMainValid ? styles.validOk : styles.validWarn]}>
          <Text style={styles.validText}>{mainCount}</Text>
        </View>
      </View>
      <View style={styles.deckMeta}>
        <Text style={styles.metaText}>Main: {mainCount} cards</Text>
        {sideCount > 0 && <Text style={styles.metaText}>· Side: {sideCount}</Text>}
        {terrain && <Text style={styles.metaText}>· {terrain.name}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export function DecklistsScreen() {
  const navigation = useNavigation<Navigation>();
  const { decks, loaded, load, deleteDeck } = useDeckStore();

  useEffect(() => {
    if (!loaded) load();
  }, [loaded]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={decks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <DeckCard
            deck={item}
            onPress={() => navigation.navigate('DeckSummary', { deck: item })}
            onDelete={() => deleteDeck(item.id)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No decks yet.{'\n'}Tap the button below to build one.
          </Text>
        }
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('DeckEditor', {})}
        activeOpacity={0.8}
      >
        <Text style={styles.createButtonText}>Create Deck</Text>
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
    gap: spacing.sm,
  },
  deckCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  seekerThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  deckHeaderInfo: {
    flex: 1,
  },
  deckName: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  seekerName: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  validBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validOk: {
    backgroundColor: '#2A7A2A30',
  },
  validWarn: {
    backgroundColor: `${colors.danger}30`,
  },
  validText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textPrimary,
  },
  deckMeta: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontFamily: fonts.heading,
    marginTop: 40,
    lineHeight: 22,
  },
  createButton: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  createButtonText: {
    color: colors.background,
    fontFamily: fonts.heading,
    fontSize: 14,
    letterSpacing: 1,
  },
});
