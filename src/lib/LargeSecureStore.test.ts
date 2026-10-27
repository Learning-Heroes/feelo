import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'

import { LargeSecureStore } from '@/lib/LargeSecureStore'

const KEY = 'sb-127-auth-token'
const SESSION = JSON.stringify({ access_token: 'secret-access-token', refresh_token: 'secret-refresh-token' })

describe('LargeSecureStore', () => {
  beforeEach(async () => {
    await LargeSecureStore.removeItem(KEY)
  })

  it('guarda_la_sesion_cifrada', async () => {
    await LargeSecureStore.setItem(KEY, SESSION)

    const stored = await AsyncStorage.getItem(KEY)
    expect(stored).not.toBeNull()
    expect(stored).not.toContain('secret')
    expect(await SecureStore.getItemAsync(KEY)).not.toBeNull()
    expect(await LargeSecureStore.getItem(KEY)).toBe(SESSION)
  })

  it('returns null when nothing is stored', async () => {
    expect(await LargeSecureStore.getItem(KEY)).toBeNull()
  })

  it('removeItem clears both the data and its key', async () => {
    await LargeSecureStore.setItem(KEY, SESSION)
    await LargeSecureStore.removeItem(KEY)

    expect(await AsyncStorage.getItem(KEY)).toBeNull()
    expect(await SecureStore.getItemAsync(KEY)).toBeNull()
  })
})
