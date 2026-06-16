import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  GAME_STATE: 'malediction:gameState',
  DECKS: 'malediction:decks',
} as const;

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (e) {
    console.error(`Failed to read ${key} from storage`, e);
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write ${key} to storage`, e);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to remove ${key} from storage`, e);
  }
}
