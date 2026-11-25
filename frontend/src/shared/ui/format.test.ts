import { describe, expect, it } from 'vitest'
import { formatDate } from './format'

describe('formatDate', () => {
  it('formata uma data sem alterar o dia', () => {
    expect(formatDate('2026-11-24')).toBe('24/11/2026')
  })

  it('aceita a data e hora retornada no perfil', () => {
    expect(formatDate('2026-11-24T19:19:00')).toBe('24/11/2026')
  })
})
