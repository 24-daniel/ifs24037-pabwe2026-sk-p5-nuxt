// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockPinia } from '../../../test-utils'
import { useAuthStore } from './authStore'
import * as authApi from '../api/authApi'
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper'

vi.mock('../api/authApi')

describe('authStore', () => {
  beforeEach(() => createMockPinia())

  it('membaca token tersimpan saat dibuat', () => {
    putAccessToken('lama')
    createMockPinia()
    const store = useAuthStore()
    expect(store.token).toBe('lama')
    expect(store.isAuthenticated).toBe(true)
  })

  it('login sukses menyimpan token', async () => {
    authApi.login.mockResolvedValue({ status: 'success', data: { token: 'T1' } })
    const store = useAuthStore()
    const promise = store.login({ email: 'a', password: 'b' })
    expect(store.isLoading).toBe(true)
    await promise
    expect(store.isLoading).toBe(false)
    expect(store.isAuthLogin).toBe(true)
    expect(store.token).toBe('T1')
    expect(getAccessToken()).toBe('T1')
    expect(store.validation).toBeNull()
  })

  it('login gagal menyimpan status validasi', async () => {
    authApi.login.mockResolvedValue({ status: 'fail', message: 'Salah', data: { email: ['x'] } })
    const store = useAuthStore()
    await store.login({})
    expect(store.isAuthLogin).toBe(false)
    expect(store.token).toBeNull()
    expect(store.validation).toEqual({ message: 'Salah', errors: { email: ['x'] } })
  })

  it('validasi memakai objek kosong jika server tidak mengirim data', async () => {
    authApi.login.mockResolvedValue({ status: 'fail', message: 'Salah' })
    const store = useAuthStore()
    await store.login({})
    expect(store.validation.errors).toEqual({})
  })

  it('register', async () => {
    const store = useAuthStore()
    authApi.register.mockResolvedValue({ status: 'success' })
    await store.register({})
    expect(store.isAuthRegister).toBe(true)
    authApi.register.mockResolvedValue({ status: 'fail', message: 'Email dipakai' })
    await store.register({})
    expect(store.isAuthRegister).toBe(false)
    expect(store.validation.message).toBe('Email dipakai')
  })

  it('logout selalu menghapus sesi lokal', async () => {
    putAccessToken('T')
    createMockPinia()
    const store = useAuthStore()
    authApi.logout.mockResolvedValue({ status: 'fail', message: 'Unauthenticated.' })
    await store.logout()
    expect(store.isAuthLogout).toBe(true)
    expect(store.token).toBeNull()
    expect(getAccessToken()).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('clearSession', () => {
    putAccessToken('T')
    createMockPinia()
    const store = useAuthStore()
    store.clearSession()
    expect(store.token).toBeNull()
    expect(getAccessToken()).toBeNull()
  })
})
