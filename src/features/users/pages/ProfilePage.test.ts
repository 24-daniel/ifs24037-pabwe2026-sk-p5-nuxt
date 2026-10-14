// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import Swal from 'sweetalert2'
import ProfilePage from './ProfilePage.vue'
import { useUsersStore } from '../states/usersStore'
import * as userApi from '../api/userApi'
import { renderWithProviders } from '../../../test-utils'

vi.mock('../api/userApi')

const profile = { id: 1, name: 'Abdullah', email: 'a@b.co', photo: 'img/profile/1.png' }
const ok = { status: 'success', message: 'Berhasil' }
const fail = { status: 'fail', message: 'Gagal total' }
const state = { users: { profile } }
const render = (initialState = state) => renderWithProviders(ProfilePage, { route: '/profile', initialState })
const photoInput = () => screen.getByLabelText('Unggah foto profil')
const image = (size) => {
  const file = new File(['x'], 'p.png', { type: 'image/png' })
  if (size) Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('ProfilePage', () => {
  beforeEach(() => {
    userApi.getProfile.mockResolvedValue({ status: 'success', data: { user: profile } })
    userApi.updateProfile.mockResolvedValue(ok)
    userApi.uploadPhoto.mockResolvedValue(ok)
    userApi.changePassword.mockResolvedValue(ok)
  })

  it('mengisi form dari profil aktif', async () => {
    await render()
    expect(screen.getByLabelText('Nama')).toHaveValue('Abdullah')
    expect(screen.getByLabelText('Email')).toHaveValue('a@b.co')
    expect(screen.getByAltText('Foto profil')).toHaveAttribute('src', 'https://open-api.delcom.org/img/profile/1.png')
  })

  it('tanpa profil: inisial & tanda strip, lalu terisi saat profil dimuat', async () => {
    const { pinia } = await render({})
    expect(screen.getByText('-')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
    const store = useUsersStore(pinia)
    store.profile = { ...profile, photo: '' }
    await waitFor(() => expect(screen.getByLabelText('Nama')).toHaveValue('Abdullah'))
    expect(screen.getByText('A')).toBeInTheDocument()
    store.profile = null
    await waitFor(() => expect(screen.getByText('-')).toBeInTheDocument())
  })

  it('validasi form profil', async () => {
    await render()
    await fireEvent.update(screen.getByLabelText('Nama'), ' ')
    await fireEvent.update(screen.getByLabelText('Email'), 'salah')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan profil' }))
    expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument()
    expect(screen.getByText('Format email tidak valid')).toBeInTheDocument()
    expect(userApi.updateProfile).not.toHaveBeenCalled()
  })

  it('simpan profil berhasil memuat ulang profil', async () => {
    await render()
    await fireEvent.update(screen.getByLabelText('Nama'), ' Baru ')
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan profil' }))
    await waitFor(() => expect(userApi.getProfile).toHaveBeenCalled())
    expect(userApi.updateProfile).toHaveBeenCalledWith({ name: 'Baru', email: 'a@b.co' })
    await waitFor(() => expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: 'success', title: 'Profil diperbarui' }))
  })

  it('simpan profil gagal menampilkan error tanpa memuat ulang', async () => {
    userApi.updateProfile.mockResolvedValue(fail)
    await render()
    await fireEvent.click(screen.getByRole('button', { name: 'Simpan profil' }))
    await waitFor(() => expect(Swal.fire).toHaveBeenCalled())
    await waitFor(() => expect(Swal.fire.mock.calls[0][0]).toMatchObject({ icon: 'error', text: 'Gagal total' }))
    expect(userApi.getProfile).not.toHaveBeenCalled()
  })

  it('unggah foto: tanpa berkas diabaikan', async () => {
    await render()
    await fireEvent.change(photoInput(), { target: { files: [] } })
    expect(userApi.uploadPhoto).not.toHaveBeenCalled()
  })

  it('unggah foto: menolak berkas bukan gambar atau terlalu besar', async () => {
    await render()
    await fireEvent.change(photoInput(), { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } })
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1), { timeout: 5000 })
    await fireEvent.change(photoInput(), { target: { files: [image(3 * 1024 * 1024)] } })
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(2), { timeout: 5000 })
    expect(userApi.uploadPhoto).not.toHaveBeenCalled()
    expect(Swal.fire.mock.calls[0][0].text).toMatch(/maksimal 2 MB/)
    expect(Swal.fire.mock.calls[1][0].text).toMatch(/maksimal 2 MB/)
  })

  it('unggah foto berhasil dan gagal', async () => {
    await render()
    await fireEvent.change(photoInput(), { target: { files: [image()] } })
    await waitFor(() => expect(userApi.getProfile).toHaveBeenCalledTimes(1))
    userApi.uploadPhoto.mockResolvedValue(fail)
    await fireEvent.change(photoInput(), { target: { files: [image()] } })
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(2))
    expect(userApi.getProfile).toHaveBeenCalledTimes(1)
  })

  it('validasi form kata sandi', async () => {
    await render()
    await fireEvent.update(screen.getByLabelText('Kata sandi baru'), '123')
    await fireEvent.update(screen.getByLabelText('Ulangi kata sandi baru'), '321')
    await fireEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }))
    expect(screen.getByText('Kata sandi saat ini wajib diisi')).toBeInTheDocument()
    expect(screen.getByText('Kata sandi baru minimal 6 karakter')).toBeInTheDocument()
    expect(screen.getByText('Konfirmasi tidak sama dengan kata sandi baru')).toBeInTheDocument()
    expect(userApi.changePassword).not.toHaveBeenCalled()
  })

  it('ganti kata sandi berhasil mengosongkan form, gagal mempertahankannya', async () => {
    await render()
    const fillPasswords = async () => {
      await fireEvent.update(screen.getByLabelText('Kata sandi saat ini'), 'lama123')
      await fireEvent.update(screen.getByLabelText('Kata sandi baru'), 'baru1234')
      await fireEvent.update(screen.getByLabelText('Ulangi kata sandi baru'), 'baru1234')
      await fireEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }))
    }

    userApi.changePassword.mockResolvedValue(fail)
    await fillPasswords()
    await waitFor(() => expect(Swal.fire).toHaveBeenCalledTimes(1))
    expect(screen.getByLabelText('Kata sandi saat ini')).toHaveValue('lama123')

    userApi.changePassword.mockResolvedValue(ok)
    await fireEvent.click(screen.getByRole('button', { name: 'Ubah kata sandi' }))
    await waitFor(() => expect(screen.getByLabelText('Kata sandi saat ini')).toHaveValue(''))
    expect(userApi.changePassword).toHaveBeenLastCalledWith({
      password: 'lama123',
      new_password: 'baru1234',
      new_password_confirmation: 'baru1234',
    })
  })
})