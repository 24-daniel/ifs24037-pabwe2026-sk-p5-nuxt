// @ts-nocheck
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/vue'
import NotFoundPage from './NotFoundPage.vue'
import { renderWithProviders } from '../../../test-utils'

describe('NotFoundPage', () => {
  it('menampilkan 404 dan tautan kembali', async () => {
    await renderWithProviders(NotFoundPage)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /kembali ke dashboard/i })).toHaveAttribute('href', '/')
  })
})
