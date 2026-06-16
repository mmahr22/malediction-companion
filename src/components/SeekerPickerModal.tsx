import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Seeker } from '../data/types';
import { sampleSeekers } from '../data/sampleSeekers';
import { FactionDots } from './FactionDots';
import { colors, fonts, radius, spacing } from '../theme/theme';

interface SeekerPickerModalProps {
  visible: boolean;
  selectedId: string | null;
  onSelect: (seeker: Seeker) => void;
  onClose: () => void;
}

export function SeekerPickerModal({ visible, selectedId, onSelect, onClose }: SeekerPickerModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Seeker</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={sampleSeekers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedId;
              return (
                <TouchableOpacity
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.seekerName}>{item.name}</Text>
                    <FactionDots faction={item.faction} size={10} />
                  </View>
                  <View style={styles.legacyRow}>
                    <Text style={styles.legacyName}>{item.legacy.name}</Text>
                    <Text style={styles.echoValue}>Starting Echo: {item.legacy.startingEcho}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.gold,
    letterSpacing: 1,
  },
  closeText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.textMuted,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  cardSelected: {
    borderColor: colors.gold,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  seekerName: {
    fontFamily: fonts.heading,
    fontSize: 15,
    color: colors.textPrimary,
  },
  legacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  legacyName: {
    fontFamily: fonts.heading,
    fontSize: 11,
    color: colors.purple,
    letterSpacing: 1,
    flexShrink: 1,
  },
  echoValue: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.gold,
    marginLeft: spacing.sm,
  },
});
