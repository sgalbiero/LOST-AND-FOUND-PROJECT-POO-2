import { describe, expect, it } from 'vitest'
import { loginPath, safeReturnPath } from './authNavigation'

describe('navegação após autenticação', () => {
  it('preserva uma rota interna com busca e fragmento', () => {
    expect(safeReturnPath('/mensagens?conversa=12#ultima')).toBe('/mensagens?conversa=12#ultima')
    expect(loginPath('/itens/42/editar')).toBe('/entrar?retorno=%2Fitens%2F42%2Feditar')
  })

  it('impede redirecionamento para endereço externo', () => {
    expect(safeReturnPath('https://exemplo.com')).toBe('/')
    expect(safeReturnPath('//exemplo.com')).toBe('/')
    expect(safeReturnPath('/\\exemplo.com')).toBe('/')
  })
})
