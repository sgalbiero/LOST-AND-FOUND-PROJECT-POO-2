import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/presentation/AuthContext'
import { initials } from '../shared/ui/format'
import { useMessageServices } from '../features/messages/presentation/MessageServicesContext'
import { loginPath } from '../features/auth/presentation/authNavigation'
import { RouteExperience } from './RouteExperience'

export function Layout() {
  const { user, signOut } = useAuth()
  const { unreadCount } = useMessageServices()
  return (
    <div className="app-shell">
      <RouteExperience />
      <a className="skip-link" href="#main-content">Pular para o conteúdo</a>
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
          <Link className="button button-primary publish-button" to={user ? '/itens/novo' : loginPath('/itens/novo')}>Perdi ou encontrei algo</Link>
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
      <main id="main-content"><Outlet /></main>
      <nav className="mobile-nav" aria-label="Navegação móvel">
        <NavLink to="/" end>Explorar</NavLink>
        <NavLink className={({ isActive }) => user && isActive ? 'active' : undefined} to={user ? '/meus-itens' : loginPath('/meus-itens')}>Meus itens</NavLink>
        <NavLink className={({ isActive }) => `mobile-publish${user && isActive ? ' active' : ''}`} to={user ? '/itens/novo' : loginPath('/itens/novo')}>Novo aviso</NavLink>
        <NavLink className={({ isActive }) => `mobile-message-link${user && isActive ? ' active' : ''}`} to={user ? '/mensagens' : loginPath('/mensagens')}>Mensagens{unreadCount > 0 && <span>{unreadCount > 9 ? '9+' : unreadCount}</span>}</NavLink>
        <NavLink className={({ isActive }) => user && isActive ? 'active' : undefined} to={user ? '/perfil' : loginPath('/perfil')}>Perfil</NavLink>
      </nav>
    </div>
  )
}
