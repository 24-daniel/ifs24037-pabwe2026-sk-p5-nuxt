// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockPinia } from '../../../test-utils'
import { useUsersStore } from './usersStore'
import * as userApi from '../api/userApi'

vi.mock('../api/userApi')

describe('usersStore', () => {
  beforeEach(() => createMockPinia())

  it('fetchUsers', async () => {
    const store = useUsersStore()
    userApi.getUsers.mockResolvedValue({ status: 'success', data: { users: [{ id: 1 }] } })
    const promise = store.fetchUsers()
    expect(store.isLoading).toBe(true)
    await promise
    expect(store.users).toEqual([{ id: 1 }])
    expect(store.isLoading).toBe(false)
    userApi.getUsers.mockResolvedValue({ status: 'fail' })
    await store.fetchUsers()
    expect(store.users).toEqual([])
  })

  it('fetchUser', async () => {
    const store = useUsersStore()
    userApi.getUserById.mockResolvedValue({ status: 'success', data: { user: { id: 2 } } })
    await store.fetchUser(2)
    expect(store.user).toEqual({ id: 2 })
    userApi.getUserById.mockResolvedValue({ status: 'fail' })
    await store.fetchUser(3)
    expect(store.user).toBeNull()
  })

  it('fetchProfile', async () => {
    const store = useUsersStore()
    userApi.getProfile.mockResolvedValue({ status: 'success', data: { user: { id: 1, name: 'A' } } })
    await store.fetchProfile()
    expect(store.profile.name).toBe('A')
    userApi.getProfile.mockResolvedValue({ status: 'fail', httpStatus: 401 })
    const response = await store.fetchProfile()
    expect(store.profile).toBeNull()
    expect(response.httpStatus).toBe(401)
  })

  it('aksi mutasi melacak status berjalan dan berhasil', async () => {
    const store = useUsersStore()
    userApi.updateProfile.mockResolvedValue({ status: 'success' })
    userApi.uploadPhoto.mockResolvedValue({ status: 'success' })
    userApi.changePassword.mockResolvedValue({ status: 'fail' })

    const pending = store.updateProfile({ name: 'x' })
    expect(store.isProfileChange).toBe(true)
    expect(store.isProfileChanged).toBe(false)
    await pending
    expect(store.isProfileChange).toBe(false)
    expect(store.isProfileChanged).toBe(true)

    await store.uploadPhoto(new File([], 'a.png'))
    expect(store.isPhotoChanged).toBe(true)

    await store.changePassword({})
    expect(store.isPasswordChange).toBe(false)
    expect(store.isPasswordChanged).toBe(false)
    expect(userApi.updateProfile).toHaveBeenCalledWith({ name: 'x' })
  })
})
