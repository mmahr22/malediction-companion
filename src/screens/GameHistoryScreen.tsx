import React, { useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHistoryStore } from '../store/historyStore';
import { useProfileStore } from '../store/profileStore';
import { NewProfileModal } from '../components/NewProfileModal';
import { GameRecord, PlayerProfile } from '../data/types';
import { colors, fonts, radius, spacing } from '../theme/theme';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getProfileStats(records: GameRecord[], profileId: string) {
  const linked = records.flatMap((r) => r.players).filter((p) => p.profileId === profileId);
  const games = linked.length;
  const wins = linked.filter((p) => p.isWinner).length;
  const seekerCounts: Record<string, number> = {};
  linked.forEach((p) => {
    if (p.seekerName) seekerCounts[p.seekerName] = (seekerCounts[p.seekerName] ?? 0) + 1;
  });
  const favoriteSeeker = Object.entries(seekerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return { games, wins, favoriteSeeker };
}

function ProfileCard({
  profile,
  records,
  selected,
  onPress,
  onLongPress,
}: {
  profile: PlayerProfile;
  records: GameRecord[];
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { games, wins, favoriteSeeker } = getProfileStats(records, profile.id);
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;

  return (
    <TouchableOpacity
      style={[styles.profileCard, { borderColor: profile.color }, selected && { backgroundColor: `${profile.color}20` }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={[styles.profileDot, { backgroundColor: profile.color }]} />
      <Text style={[styles.profileName, { color: profile.color }]}>{profile.name}</Text>
      <Text style={styles.profileStat}>{wins}W · {games}G</Text>
      {games > 0 && <Text style={styles.profileWinRate}>{winRate}%</Text>}
      {favoriteSeeker && <Text style={styles.profileSeeker}>{favoriteSeeker}</Text>}
    </TouchableOpacity>
  );
}

function GameRecordCard({ record, onDelete }: { record: GameRecord; onDelete: () => void }) {
  const winner = record.players.find((p) => p.isWinner);

  const handleLongPress = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this game record?')) onDelete();
    } else {
      Alert.alert('Delete Record', 'Delete this game record?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]);
    }
  };

  return (
    <TouchableOpacity style={styles.card} onLongPress={handleLongPress} activeOpacity={0.9}>
      <View style={styles.cardHeader}>
        <Text style={styles.dateText}>{formatDate(record.date)}</Text>
        <Text style={styles.metaText}>
          {record.rounds} {record.rounds === 1 ? 'Round' : 'Rounds'} · Goal {record.masteryGoal}
        </Text>
      </View>

      {winner ? (
        <View style={styles.winnerRow}>
          <MaterialCommunityIcons name="crown" size={13} color={colors.gold} />
          <Text style={styles.winnerName}>{winner.name}</Text>
          {winner.seekerName && (
            <Text style={styles.winnerSeeker}> — {winner.seekerName}</Text>
          )}
        </View>
      ) : (
        <Text style={styles.noWinner}>Ended Early</Text>
      )}

      <View style={styles.divider} />

      {record.players.map((p, i) => (
        <View key={i} style={styles.playerRow}>
          <Text style={[styles.playerName, p.isWinner && styles.playerNameWinner]}>
            {p.isWinner && '▸ '}{p.name}
          </Text>
          <View style={styles.playerStats}>
            {p.husks > 0 && (
              <Text style={styles.huskCount}>{p.husks} {p.husks === 1 ? 'Husk' : 'Husks'}</Text>
            )}
            <Text style={[styles.playerMastery, p.isWinner && styles.playerMasteryWinner]}>
              {p.finalMastery}
            </Text>
          </View>
        </View>
      ))}
    </TouchableOpacity>
  );
}

export function GameHistoryScreen() {
  const records = useHistoryStore((s) => s.records);
  const deleteRecord = useHistoryStore((s) => s.deleteRecord);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const profiles = useProfileStore((s) => s.profiles);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const deleteProfile = useProfileStore((s) => s.deleteProfile);

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<PlayerProfile | null>(null);

  const profilesWithGames = profiles.filter((p) =>
    records.some((r) => r.players.some((pl) => pl.profileId === p.id))
  );

  const filteredRecords = selectedProfileId
    ? records.filter((r) => r.players.some((p) => p.profileId === selectedProfileId))
    : records;

  const handleProfilePress = (profileId: string) => {
    setSelectedProfileId((prev) => (prev === profileId ? null : profileId));
  };

  if (records.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.empty}>
          <MaterialCommunityIcons name="book-open-outline" size={40} color={colors.border} />
          <Text style={styles.emptyText}>No games recorded yet</Text>
          <Text style={styles.emptySubtext}>Completed games will appear here</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameRecordCard record={item} onDelete={() => deleteRecord(item.id)} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          profilesWithGames.length > 0 ? (
            <View style={styles.profileSection}>
              <Text style={styles.sectionLabel}>Players</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.profileScroll}
              >
                {profilesWithGames.map((p) => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    records={records}
                    selected={selectedProfileId === p.id}
                    onPress={() => handleProfilePress(p.id)}
                    onLongPress={() => setEditingProfile(p)}
                  />
                ))}
              </ScrollView>
              {selectedProfileId && (
                <TouchableOpacity onPress={() => setSelectedProfileId(null)}>
                  <Text style={styles.clearFilter}>Show all games ×</Text>
                </TouchableOpacity>
              )}
              <View style={styles.divider} />
            </View>
          ) : null
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
            <Text style={styles.clearBtnText}>Clear History</Text>
          </TouchableOpacity>
        }
      />

      <NewProfileModal
        visible={!!editingProfile}
        profile={editingProfile}
        onUpdate={(id, name, color) => {
          updateProfile(id, name, color);
          setEditingProfile(null);
        }}
        onDelete={(id) => {
          deleteProfile(id);
          if (selectedProfileId === id) setSelectedProfileId(null);
          setEditingProfile(null);
        }}
        onClose={() => setEditingProfile(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  profileSection: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  profileScroll: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minWidth: 120,
    gap: 4,
    backgroundColor: colors.surface,
  },
  profileDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  profileName: {
    fontFamily: fonts.display,
    fontSize: 14,
  },
  profileStat: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  profileWinRate: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  profileSeeker: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  clearFilter: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  metaText: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  winnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  winnerName: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.gold,
  },
  winnerSeeker: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.textMuted,
  },
  noWinner: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  huskCount: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.gold,
  },
  playerName: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.textMuted,
  },
  playerNameWinner: {
    color: colors.textPrimary,
  },
  playerMastery: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.textMuted,
  },
  playerMasteryWinner: {
    color: colors.gold,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  emptySubtext: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.border,
    letterSpacing: 1,
  },
  clearBtn: {
    marginTop: spacing.xl,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
  },
  clearBtnText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.danger,
    letterSpacing: 2,
  },
});
