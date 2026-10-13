// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import Swal from 'sweetalert2'
import LoginPage from './LoginPage.vue'
import * as authApi from '../api/authApi'
import { deferred, renderWithProviders } from '../../../test-utils'

vi.mock('../api/authApi')

const fill = async (email, password) => {
  await fireEvent.update(screen.getByLabelText('Email'), email)
  await fireEvent.update(screen.getByLabelText('Kata sandi'), password)
}

describe('LoginPage', () => {
  beforeEach(() => authApi.login.mockResolvedValue({ status: 'success', data: { token: 'TOK' } }))

  it('menampilkan error validasi untuk form kosong', async () => {
    await renderWithProviders(LoginPage, { route: '/auth/login' })
    await fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(screen.getByText('Email wajib diisi')).toBeInTheDocument()
    expect(screen.getByText('Kata sandi wajib diisi')).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('menolak format email yang salah', async () => {
    await renderWithProviders(LoginPage, { route: '/auth/login' })
    await fill('bukan-email', 'rahasia')
    await fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(screen.getByText('Format email tidak valid')).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('login berhasil mengarahkan ke dashboard', async () => {
    const { router } = await renderWithProviders(LoginPage, { route: '/auth/login' })
    await fill(' a@b.co ', 'rahasia')
    await fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/'))
    expect(authApi.login).toHaveBeenCalledWith({ email: 'a@b.co', password: 'rahasia' })
    expect(localStorage.length).toBe(1)
  })

  it('login gagal menampilkan dialog error', async () => {
    authApi.login.mockResolvedValue({ status: 'fail', message: 'Kredensial akun tidak ditemukan' })
    const { router } = await renderWithProviders(LoginPage, { route: '/auth/login' })
    await fill('a@b.co', 'salah')
    await fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled())
    expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: 'error', title: 'Login gagal', text: 'Kredensial akun tidak ditemukan' })
    expect(router.currentRoute.value.path).toBe('/auth/login')
  })

  it('menonaktifkan tombol saat memproses', async () => {
    const pending = deferred()
    authApi.login.mockReturnValue(pending.promise)
    await renderWithProviders(LoginPage, { route: '/auth/login' })
    await fill('a@b.co', 'rahasia')
    await fireEvent.click(screen.getByRole('button', { name: 'Masuk' }))
    expect(await screen.findByRole('button', { name: 'Memproses…' })).toBeDisabled()
    pending.resolve({ status: 'fail', message: 'x' })
  })

  it('memiliki tautan ke halaman registrasi', async () => {
    await renderWithProviders(LoginPage, { route: '/auth/login' })
    expect(screen.getByRole('link', { name: /daftar sekarang/i })).toHaveAttribute('href', '/auth/register')
  })
})
