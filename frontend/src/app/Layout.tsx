import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/presentation/AuthContext'
import { initials } from '../shared/ui/format'
import { useMessageServices } from '../features/messages/presentation/MessageServicesContext'

export function Layout() {
  const { user, signOut } = useAuth()
  const { unreadCount } = useMessageServices()
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand" aria-label="Reencontra — página inicial">
          <span className="brand-symbol" aria-hidden="true">R</span>
          <span><strong>Reencontra</strong><small>Achados e perdidos</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Navegação principal">
          <NavLink to="/" end>Explorar</NavLink>
          {user && <NavLink to="/meus-itens">Meus itens</NavLink>}
          {user && <NavLink className="nav-with-badge" to="/mensagens">Mensagens{unreadCount > 0 && <span>{unreadCount > 9 ? '9+' : unreadCount}</span>}</NavLink>}
        </nav>
        <div className="topbar-actions">
          <Link className="button button-primary publish-button" to={user ? '/itens/novo' : '/entrar'}>Perdi ou encontrei algo</Link>
          {user ? (
            <details className="user-menu">
              <summary aria-label="Abrir menu do usuário"><span>{initials(user.name)}</span>{user.name.split(' ')[0]}</summary>
              <div>
                <Link to="/perfil">Meu perfil</Link>
                <Link to="/reivindicacoes">Reivindicações</Link>
                {user.role === 'ADMIN'
                  ? <Link to="/admin">Painel da equipe</Link>
                  : <Link to="/mediacoes">Pedidos de ajuda</Link>}
                <button type="button" onClick={signOut}>Sair</button>
              </div>
            </details>
          ) : <Link className="login-link" to="/entrar">Entrar</Link>}
        </div>
      </header>
      <main><Outlet /></main>
      <nav className="mobile-nav" aria-label="Navegação móvel">
        <NavLink to="/" end>Explorar</NavLink>
        <NavLink to={user ? '/meus-itens' : '/entrar'}>Meus itens</NavLink>
        <NavLink className="mobile-publish" to={user ? '/itens/novo' : '/entrar'}>Novo aviso</NavLink>
        <NavLink className="mobile-message-link" to={user ? '/mensagens' : '/entrar'}>Mensagens{unreadCount > 0 && <span>{unreadCount > 9 ? '9+' : unreadCount}</span>}</NavLink>
        <NavLink to={user ? '/perfil' : '/entrar'}>Perfil</NavLink>
      </nav>
    </div>
  )
}
