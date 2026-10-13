// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  buildUrl,
  fetchApi,
  getAccessToken,
  isSuccess,
  putAccessToken,
  removeAccessToken,
} from './apiHelper'

const mockFetch = (json, status = 200) => {
  globalThis.fetch = vi.fn().mockResolvedValue({ status, json: () => Promise.resolve(json) })
}

describe('apiHelper', () => {
  beforeEach(() => mockFetch({ status: 'success' }))

  it('menyimpan, membaca, dan menghapus token', () => {
    expect(getAccessToken()).toBeNull()
    putAccessToken('abc')
    expect(getAccessToken()).toBe('abc')
    removeAccessToken()
    expect(getAccessToken()).toBeNull()
  })

  it('isSuccess hanya true untuk status success', () => {
    expect(isSuccess({ status: 'success' })).toBe(true)
    expect(isSuccess({ status: 'fail' })).toBe(false)
    expect(isSuccess(undefined)).toBe(false)
  })

  it('buildUrl menambahkan query dan mengabaikan nilai kosong', () => {
    expect(buildUrl('/cash-flows')).toBe('https://open-api.delcom.org/api/v1/cash-flows')
    const url = buildUrl('/cash-flows', { type: 'inflow', source: 'cash', a: undefined, b: null, c: '' })
    expect(url).toBe('https://open-api.delcom.org/api/v1/cash-flows?type=inflow&source=cash')
  })

  it('mengirim header Authorization jika token tersedia', async () => {
    putAccessToken('tok')
    await fetchApi('/users')
    const [, options] = fetch.mock.calls[0]
    expect(options.method).toBe('GET')
    expect(options.headers.Authorization).toBe('Bearer tok')
    expect(options.body).toBeUndefined()
  })

  it('tidak mengirim Authorization tanpa token atau saat auth=false', async () => {
    await fetchApi('/users')
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
    putAccessToken('tok')
    await fetchApi('/auth/login', { auth: false })
    expect(fetch.mock.calls[1][1].headers.Authorization).toBeUndefined()
  })

  it('meng-encode body JSON dan membiarkan FormData', async () => {
    await fetchApi('/x', { method: 'POST', body: { a: 1 } })
    let options = fetch.mock.calls[0][1]
    expect(options.body).toBe('{"a":1}')
    expect(options.headers['Content-Type']).toBe('application/json')

    const form = new FormData()
    await fetchApi('/x', { method: 'POST', body: form })
    options = fetch.mock.calls[1][1]
    expect(options.body).toBe(form)
    expect(options.headers['Content-Type']).toBeUndefined()
  })

  it('mengembalikan json beserta httpStatus', async () => {
    mockFetch({ status: 'success', data: { ok: 1 } }, 200)
    expect(await fetchApi('/x')).toEqual({ status: 'success', data: { ok: 1 }, httpStatus: 200 })
  })

  it('menghapus token saat 401', async () => {
    putAccessToken('tok')
    mockFetch({ status: 'fail', message: 'Unauthenticated.' }, 401)
    const result = await fetchApi('/x')
    expect(result.httpStatus).toBe(401)
    expect(getAccessToken()).toBeNull()
  })

  it('mengembalikan status fail saat jaringan error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'))
    expect(await fetchApi('/x')).toEqual({
      status: 'fail',
      message: 'Tidak dapat terhubung ke server',
      httpStatus: 0,
    })
  })

  it('wrapper HTTP memakai method yang benar', async () => {
    await apiGet('/a', { q: 1 })
    await apiPost('/a', { x: 1 }, false)
    await apiPut('/a', { x: 1 })
    await apiDelete('/a')
    expect(fetch.mock.calls.map(([, o]) => o.method)).toEqual(['GET', 'POST', 'PUT', 'DELETE'])
    expect(fetch.mock.calls[0][0]).toContain('?q=1')
  })
})
