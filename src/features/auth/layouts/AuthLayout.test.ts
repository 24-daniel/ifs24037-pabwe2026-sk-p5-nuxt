// @ts-nocheck
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/vue'
import AuthLayout from './AuthLayout.vue'
import { renderWithProviders } from '../../../test-utils'

describe('AuthLayout', () => {
  it('menampilkan banner dan konten rute anak', async () => {
    await renderWithProviders(AuthLayout)
    expect(screen.getByTestId('auth-banner')).toBeInTheDocument()
    expect(screen.getAllByText('Delcom Cash Flow').length).toBeGreaterThan(0)
    expect(screen.getByTestId('blank')).toBeInTheDocument()
  })
})
