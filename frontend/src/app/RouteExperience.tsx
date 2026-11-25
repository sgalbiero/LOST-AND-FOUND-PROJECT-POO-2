import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const DEFAULT_TITLE = 'Reencontra — Achados e Perdidos'

export function RouteExperience() {
  const { pathname } = useLocation()
  const title = pageTitle(pathname)

  useEffect(() => {
    document.title = title
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, title])

  return <span className="sr-only" aria-live="polite">{title}</span>
}

export function pageTitle(pathname: string) {
  if (pathname === '/') return DEFAULT_TITLE
  if (pathname === '/entrar') return 'Entrar — Reencontra'
  if (pathname === '/cadastro') return 'Criar conta — Reencontra'
  if (pathname === '/meus-itens') return 'Meus itens — Reencontra'
  if (pathname === '/reivindicacoes') return 'Reivindicações — Reencontra'
  if (pathname === '/mensagens') return 'Mensagens — Reencontra'
  if (pathname === '/perfil') return 'Meu perfil — Reencontra'
  if (pathname === '/mediacoes') return 'Pedidos de ajuda — Reencontra'
  if (pathname === '/itens/novo') return 'Nova publicação — Reencontra'
  if (/^\/itens\/\d+\/editar$/.test(pathname)) return 'Editar publicação — Reencontra'
  if (/^\/itens\/\d+\/devolucao$/.test(pathname)) return 'Registrar devolução — Reencontra'
  if (/^\/itens\/\d+$/.test(pathname)) return 'Detalhes do item — Reencontra'
  if (pathname.startsWith('/admin')) return 'Painel da equipe — Reencontra'
  return 'Página não encontrada — Reencontra'
}
