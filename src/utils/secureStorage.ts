/**
 * Adaptateur redux-persist compatible avec expo-secure-store.
 * Gère le découpage en morceaux pour contourner la limite de 2Ko par entrée (iOS Keychain).
 */
import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1900;

/** SecureStore n'accepte que [a-zA-Z0-9._-]. On remplace tout autre caractère par "_". */
const sanitizeKey = (key: string): string => key.replace(/[^a-zA-Z0-9._-]/g, '_');

const secureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const k = sanitizeKey(key);
      const countStr = await SecureStore.getItemAsync(`${k}_chunks`);
      if (countStr) {
        const count = parseInt(countStr, 10);
        const parts: string[] = [];
        for (let i = 0; i < count; i++) {
          const chunk = await SecureStore.getItemAsync(`${k}_chunk_${i}`);
          if (chunk) parts.push(chunk);
        }
        return parts.join('');
      }
      return await SecureStore.getItemAsync(k);
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const k = sanitizeKey(key);
      if (value.length > CHUNK_SIZE) {
        const count = Math.ceil(value.length / CHUNK_SIZE);
        await SecureStore.setItemAsync(`${k}_chunks`, String(count));
        for (let i = 0; i < count; i++) {
          await SecureStore.setItemAsync(
            `${k}_chunk_${i}`,
            value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
          );
        }
      } else {
        // Nettoyer d'éventuels anciens chunks
        const oldCount = await SecureStore.getItemAsync(`${k}_chunks`);
        if (oldCount) {
          const n = parseInt(oldCount, 10);
          for (let i = 0; i < n; i++) {
            await SecureStore.deleteItemAsync(`${k}_chunk_${i}`);
          }
          await SecureStore.deleteItemAsync(`${k}_chunks`);
        }
        await SecureStore.setItemAsync(k, value);
      }
    } catch (error) {
      if (__DEV__) console.error('[SecureStorage] setItem error:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const k = sanitizeKey(key);
      const countStr = await SecureStore.getItemAsync(`${k}_chunks`);
      if (countStr) {
        const count = parseInt(countStr, 10);
        for (let i = 0; i < count; i++) {
          await SecureStore.deleteItemAsync(`${k}_chunk_${i}`);
        }
        await SecureStore.deleteItemAsync(`${k}_chunks`);
      } else {
        await SecureStore.deleteItemAsync(k);
      }
    } catch (error) {
      if (__DEV__) console.error('[SecureStorage] removeItem error:', error);
    }
  },
};

export default secureStorage;
