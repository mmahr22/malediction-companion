import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { FACTION_IMAGES, parseFactions } from '../theme/factions';

interface FactionDotsProps {
  faction: string;
  size?: number;
}

export function FactionDots({ faction, size = 14 }: FactionDotsProps) {
  const factions = parseFactions(faction);
  return (
    <View style={styles.row}>
      {factions.map((f) => {
        const source = FACTION_IMAGES[f];
        if (!source) return null;
        return (
          <Image
            key={f}
            source={source}
            style={{ width: size, height: size }}
            resizeMode="contain"
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
