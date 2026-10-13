// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import * as userApi from './userApi'
import * as apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({
  apiGet: vi.fn(() => Promise.resolve({})),
  apiPost: vi.fn(() => Promise.resolve({})),
  apiPut: vi.fn(() => Promise.resolve({})),
}))

describe('userApi', () => {
  it('endpoint GET', async () => {
    await userApi.getUsers()
    await userApi.getUserById(7)
    await userApi.getProfile()
    expect(apiHelper.apiGet.mock.calls).toEqual([['/users'], ['/users/7'], ['/users/me']])
  })

  it('update profil & ganti kata sandi', async () => {
    await userApi.updateProfile({ name: 'N', email: 'e', lain: 1 })
    await userApi.changePassword({ password: 'a', new_password: 'b', new_password_confirmation: 'b' })
    expect(apiHelper.apiPut).toHaveBeenNthCalledWith(1, '/users/me', { name: 'N', email: 'e' })
    expect(apiHelper.apiPut).toHaveBeenNthCalledWith(2, '/users/password', {
      password: 'a',
      new_password: 'b',
      new_password_confirmation: 'b',
    })
  })

  it('upload foto memakai FormData field "photo"', async () => {
    const file = new File(['x'], 'p.png', { type: 'image/png' })
    await userApi.uploadPhoto(file)
    const [path, body] = apiHelper.apiPost.mock.calls[0]
    expect(path).toBe('/users/me/photo')
    expect(body.get('photo')).toBe(file)
  })
})
