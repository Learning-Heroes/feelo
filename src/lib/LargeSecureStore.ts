import 'react-native-get-random-values'

import AsyncStorage from '@react-native-async-storage/async-storage'
import * as aesjs from 'aes-js'
import * as SecureStore from 'expo-secure-store'

// Official Supabase React Native pattern: a session can exceed SecureStore's 2048-byte limit, so the
// session is AES-encrypted into AsyncStorage and only its random key lives in SecureStore.
async function encrypt(key: string, value: string): Promise<string> {
  const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8))
  const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1))
  const encrypted = cipher.encrypt(aesjs.utils.utf8.toBytes(value))
  await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey))
  return aesjs.utils.hex.fromBytes(encrypted)
}

async function decrypt(key: string, value: string): Promise<string | null> {
  const encryptionKeyHex = await SecureStore.getItemAsync(key)
  if (!encryptionKeyHex) return null
  const cipher = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(encryptionKeyHex), new aesjs.Counter(1))
  return aesjs.utils.utf8.fromBytes(cipher.decrypt(aesjs.utils.hex.toBytes(value)))
}

export const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    const encrypted = await AsyncStorage.getItem(key)
    return encrypted ? decrypt(key, encrypted) : null
  },
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, await encrypt(key, value))
  },
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key)
    await SecureStore.deleteItemAsync(key)
  },
}
