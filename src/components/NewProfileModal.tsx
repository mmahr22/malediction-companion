import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PlayerProfile } from '../data/types';
import { colors, fonts, radius, spacing } from '../theme/theme';

export const PROFILE_COLORS = [
  '#C0392B', // crimson
  '#D4AF37', // gold
  '#27AE60', // emerald
  '#2980B9', // sapphire
  '#8E44AD', // violet
  '#E67E22', // amber
  '#16A085', // teal
  '#C0557A', // rose
];

interface ProfileModalProps {
  visible: boolean;
  profile?: PlayerProfile | null;
  onCreate?: (name: string, color: string) => void;
  onUpdate?: (id: string, name: string, color: string) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function NewProfileModal({ visible, profile, onCreate, onUpdate, onDelete, onClose }: ProfileModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROFILE_COLORS[0]);
  const isEditing = !!profile;

  useEffect(() => {
    if (visible && profile) {
      setName(profile.name);
      setSelectedColor(profile.color);
    } else if (visible) {
      setName('');
      setSelectedColor(PROFILE_COLORS[0]);
    }
  }, [visible, profile]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (isEditing && onUpdate) {
      onUpdate(profile!.id, name.trim(), selectedColor);
    } else if (onCreate) {
      onCreate(name.trim(), selectedColor);
    }
    setName('');
    setSelectedColor(PROFILE_COLORS[0]);
  };

  const handleClose = () => {
    setName('');
    setSelectedColor(PROFILE_COLORS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{isEditing ? 'Edit Profile' : 'New Profile'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Player name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={24}
          />

          <Text style={styles.colorLabel}>Color</Text>
          <View style={styles.colorRow}>
            {PROFILE_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  selectedColor === c && styles.swatchSelected,
                ]}
                onPress={() => setSelectedColor(c)}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createBtn, !name.trim() && styles.createBtnDisabled]}
              onPress={handleSubmit}
              disabled={!name.trim()}
            >
              <Text style={styles.createText}>{isEditing ? 'Save' : 'Create'}</Text>
            </TouchableOpacity>
          </View>

          {isEditing && onDelete && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(profile!.id)}
            >
              <Text style={styles.deleteText}>Delete Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.background,
    color: colors.textPrimary,
    fontFamily: fonts.heading,
    fontSize: 15,
  },
  colorLabel: {
    fontFamily: fonts.heading,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  colorRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  createBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createText: {
    fontFamily: fonts.heading,
    fontSize: 13,
    color: colors.gold,
    letterSpacing: 1,
  },
  deleteBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  deleteText: {
    fontFamily: fonts.heading,
    fontSize: 12,
    color: colors.danger,
    letterSpacing: 1,
  },
});
