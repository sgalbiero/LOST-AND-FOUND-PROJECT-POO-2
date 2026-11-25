import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/presentation/AuthContext'
import { formatDate } from '../../../shared/ui/format'
import type { SupportUser } from '../domain/Moderation'
import { useModeration } from './ModerationContext'

export function SupportUsersPage() {
  const { user: currentUser } = useAuth()
  const service = useModeration()
  const [users, setUsers] = useState<SupportUser[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const load = useCallback(async (signal?: AbortSignal) => { try { setUsers(await service.listUsers(signal)); setError('') } catch (cause) { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os usuários.') } finally { if (!signal?.aborted) setLoading(false) } }, [service])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort() }, [load])
  const visible = useMemo(() => { const term = query.trim().toLocaleLowerCase('pt-BR'); return term ? users.filter(user => `${user.name} ${user.email}`.toLocaleLowerCase('pt-BR').includes(term)) : users }, [query, users])
  async function act(target: SupportUser, work: () => Promise<SupportUser>, message: string) { setBusyId(target.id); setError(''); setFeedback(''); try { const updated = await work(); setUsers(current => current.map(user => user.id === updated.id ? updated : user)); setFeedback(message) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o usuário.') } finally { setBusyId(null) } }
  return <div className="page-container moderation-page">
    <header className="dashboard-header"><div><Link className="section-back" to="/admin">← Painel da equipe</Link><span className="eyebrow">Acesso</span><h1>Usuários</h1><p>Consulte contas, conceda acesso à equipe e reative usuários quando necessário.</p></div></header>
    {feedback && <div className="success-banner" role="status">{feedback}</div>}{error && <div className="form-error" role="alert">{error}</div>}
    <section className="admin-section"><div className="admin-section-toolbar"><div><h2>Contas ({users.length})</h2><small>{users.filter(user => user.active).length} ativas</small></div><label><span className="sr-only">Buscar usuário</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por nome ou e-mail" /></label></div>
      {loading ? <p>Carregando usuários...</p> : visible.length === 0 ? <p>Nenhum usuário encontrado.</p> : visible.map(user => <article className="admin-row user-admin-row" key={user.id}><div><strong>{user.name}</strong><span>{user.email}</span><small>Cadastrado em {formatDate(user.registeredAt.slice(0, 10))}</small></div><div className="user-admin-controls"><span className={`status ${user.active ? 'status-aberto' : 'status-cancelado'}`}>{user.active ? 'Ativa' : 'Desativada'}</span><label><span className="sr-only">Perfil de {user.name}</span><select value={user.role} disabled={busyId === user.id || user.id === currentUser?.id || !user.active} onChange={event => void act(user, () => service.updateUserRole(user.id, event.target.value as SupportUser['role']), 'Perfil de acesso atualizado.')}><option value="ALUNO">Aluno</option><option value="ADMIN">Equipe de apoio</option></select></label><button className="button button-ghost" disabled={busyId === user.id || user.id === currentUser?.id} onClick={() => void act(user, () => service.setUserActive(user.id, !user.active), user.active ? 'Conta desativada.' : 'Conta reativada.')}>{busyId === user.id ? 'Atualizando...' : user.active ? 'Desativar' : 'Reativar'}</button></div></article>)}
    </section>
  </div>
}
