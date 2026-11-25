import { describe, expect, it } from 'vitest'
import { pageTitle } from './RouteExperience'

describe('experiência de navegação', () => {
  it('define títulos úteis para as páginas principais', () => {
    expect(pageTitle('/')).toBe('Reencontra — Achados e Perdidos')
    expect(pageTitle('/mensagens')).toBe('Mensagens — Reencontra')
    expect(pageTitle('/itens/42/editar')).toBe('Editar publicação — Reencontra')
    expect(pageTitle('/endereco-inexistente')).toBe('Página não encontrada — Reencontra')
  })
})
