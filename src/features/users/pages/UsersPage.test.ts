// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/vue'
import UsersPage from './UsersPage.vue'
import * as userApi from '../api/userApi'
import { deferred, renderWithProviders } from '../../../test-utils'

vi.mock('../api/userApi')

const users = [
  { id: 1, name: 'Delcom Testing', email: 'testing@delcom.org', photo: 'img/profile/1.png', created_at: '2024-10-05T02:53:38.000000Z' },
  { id: 2, name: 'Abdullah Ubaid', email: 'ifs18005@delcom.org', photo: '', created_at: '2024-10-05T03:18:14.000000Z' },
]

describe('UsersPage', () => {
  beforeEach(() => userApi.getUsers.mockResolvedValue({ status: 'success', data: { users } }))

  it('menampilkan daftar pengguna dengan foto atau inisial', async () => {
    await renderWithProviders(UsersPage)
    await waitFor(() => expect(screen.getAllByTestId('user-card')).toHaveLength(2))
    expect(screen.getByAltText('Delcom Testing')).toHaveAttribute('src', 'https://open-api.delcom.org/img/profile/1.png')
    expect(screen.getByText('AU')).toBeInTheDocument()
    expect(screen.getByText('ifs18005@delcom.org')).toBeInTheDocument()
  })

  it('menampilkan status memuat', async () => {
    const pending = deferred()
    userApi.getUsers.mockReturnValue(pending.promise)
    await renderWithProviders(UsersPage)
    expect(screen.getByText('Memuat pengguna…')).toBeInTheDocument()
    pending.resolve({ status: 'success', data: { users: [] } })
    expect(await screen.findByText('Belum ada pengguna terdaftar.')).toBeInTheDocument()
  })
})
