// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import Swal from 'sweetalert2'
import RegisterPage from './RegisterPage.vue'
import * as authApi from '../api/authApi'
import { deferred, renderWithProviders } from '../../../test-utils'

vi.mock('../api/authApi')

const fill = async (name, email, password) => {
  await fireEvent.update(screen.getByLabelText('Nama lengkap'), name)
  await fireEvent.update(screen.getByLabelText('Email'), email)
  await fireEvent.update(screen.getByLabelText('Kata sandi'), password)
}
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Daftar' }))

describe('RegisterPage', () => {
  beforeEach(() => authApi.register.mockResolvedValue({ status: 'success', message: 'Berhasil melakukan pendaftaran' }))

  it('validasi form kosong', async () => {
    await renderWithProviders(RegisterPage, { route: '/auth/register' })
    await submit()
    expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument()
    expect(screen.getByText('Email wajib diisi')).toBeInTheDocument()
    expect(screen.getByText('Kata sandi minimal 6 karakter')).toBeInTheDocument()
    expect(authApi.register).not.toHaveBeenCalled()
  })

  it('validasi format email', async () => {
    await renderWithProviders(RegisterPage, { route: '/auth/register' })
    await fill('Dani', 'salah', '123456')
    await submit()
    expect(screen.getByText('Format email tidak valid')).toBeInTheDocument()
  })

  it('registrasi berhasil menampilkan dialog lalu ke halaman login', async () => {
    const { router } = await renderWithProviders(RegisterPage, { route: '/auth/register' })
    await fill(' Dani ', 'd@del.ac.id', '123456')
    await submit()
    await waitFor(() => expect(router.currentRoute.value.path).toBe('/auth/login'))
    expect(authApi.register).toHaveBeenCalledWith({ name: 'Dani', email: 'd@del.ac.id', password: '123456' })
    await waitFor(() => expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: 'success', title: 'Pendaftaran berhasil' }))
  })

  it('registrasi gagal menampilkan detail validasi', async () => {
    authApi.register.mockResolvedValue({ status: 'fail', message: 'Data tidak valid', data: { email: ['Email sudah dipakai'] } })
    const { router } = await renderWithProviders(RegisterPage, { route: '/auth/register' })
    await fill('Dani', 'd@del.ac.id', '123456')
    await submit()
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled())
    await waitFor(() => expect(Swal.fire.mock.calls[0][0].text).toBe('Data tidak valid\nEmail sudah dipakai'))
    expect(router.currentRoute.value.path).toBe('/auth/register')
  })

  it('tombol nonaktif saat memproses & tautan login', async () => {
    const pending = deferred()
    authApi.register.mockReturnValue(pending.promise)
    await renderWithProviders(RegisterPage, { route: '/auth/register' })
    await fill('Dani', 'd@del.ac.id', '123456')
    await submit()
    expect(await screen.findByRole('button', { name: 'Memproses…' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/auth/login')
    pending.resolve({ status: 'fail', message: 'x' })
  })
})
