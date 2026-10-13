// @ts-nocheck
import { describe, expect, it } from 'vitest'
import useInput, { useInput as namedUseInput } from './useInput'

describe('useInput', () => {
  it('named dan default export sama', () => {
    expect(useInput).toBe(namedUseInput)
  })

  it('memakai nilai default dan menerima event maupun nilai langsung', () => {
    const [value, onChange, reset] = useInput('awal')
    expect(value.value).toBe('awal')
    onChange({ target: { value: 'dari event' } })
    expect(value.value).toBe('dari event')
    onChange('langsung')
    expect(value.value).toBe('langsung')
    reset()
    expect(value.value).toBe('awal')
  })

  it('default kosong', () => {
    const [value] = useInput()
    expect(value.value).toBe('')
  })
})
