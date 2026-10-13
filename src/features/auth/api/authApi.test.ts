// @ts-nocheck
import { describe, expect, it, vi } from 'vitest'
import * as authApi from './authApi'
import * as apiHelper from '../../../helpers/apiHelper'

vi.mock('../../../helpers/apiHelper', () => ({ apiPost: vi.fn(() => Promise.resolve({ status: 'success' })) }))

describe('authApi', () => {
  it('login & register tanpa token', async () => {
    await authApi.login({ email: 'a@b.co', password: 'x', extra: 1 })
    await authApi.register({ name: 'N', email: 'a@b.co', password: 'x' })
    expect(apiHelper.apiPost).toHaveBeenNthCalledWith(1, '/auth/login', { email: 'a@b.co', password: 'x' }, false)
    expect(apiHelper.apiPost).toHaveBeenNthCalledWith(2, '/auth/register', { name: 'N', email: 'a@b.co', password: 'x' }, false)
  })

  it('logout memakai token', async () => {
    await authApi.logout()
    expect(apiHelper.apiPost).toHaveBeenCalledWith('/auth/logout')
  })
})
