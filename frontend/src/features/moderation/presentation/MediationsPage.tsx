import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../auth/presentation/AuthContext'
import type { Mediation } from '../domain/Moderation'
import { useModeration } from './ModerationContext'

const labels = { PENDENTE: 'Pendente', EM_ANDAMENTO: 'Em andamento', RESOLVIDO: 'Resolvida', CANCELADA: 'Cancelada' }

export function MediationsPage() {
  const service = useModeration()
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const conversationId = Number(params.get('conversa'))
  const [items, setItems] = useState<Mediation[]>([])
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    if (user?.role === 'ADMIN') return
    const controller = new AbortController()
    const load = () => service.listMyMediations(controller.signal).then(setItems).catch(cause => { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause.message) })
    void load()
    const timer = window.setInterval(load, 10000)
    return () => { controller.abort(); window.clearInterval(timer) }
  }, [reload, service, user?.role])

  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setFeedback('')
    try { await service.requestMediation(conversationId, reason); setReason(''); setParams({}); setFeedback('Pedido enviado. A Equipe de apoio já pode visualizá-lo no painel.'); setReload(value => value + 1) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível solicitar a mediação.') }
    finally { setBusy(false) }
  }

  return <div className="page-container moderation-page"><header className="dashboard-header"><div><span className="eyebrow">Equipe de apoio</span><h1>Meus pedidos de ajuda</h1><p>Acompanhe as situações em que a equipe ajuda os participantes a chegar a uma solução.</p></div></header>
    {Number.isInteger(conversationId) && conversationId > 0 && <form className="form item-form moderation-composer" onSubmit={submit}><h2>Pedir ajuda à equipe</h2><p>Conte o que aconteceu e em que ponto vocês precisam de ajuda para seguir.</p><label><span>Motivo</span><textarea rows={5} maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} required /></label><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setParams({})}>Cancelar</button><button className="button button-primary" disabled={busy}>{busy ? 'Enviando...' : 'Enviar pedido'}</button></div></form>}
    {feedback && <div className="success-banner" role="status">{feedback}</div>}{error && <div className="form-error" role="alert">{error}</div>}
    <div className="moderation-list">{items.length === 0 ? <p>Nenhum pedido de ajuda enviado.</p> : items.map(item => <article className="admin-card" key={item.id}><div><span className={`status status-${item.status.toLowerCase()}`}>{labels[item.status]}</span><h2><Link to={`/itens/${item.itemId}`}>{item.itemTitle}</Link></h2>{item.conversation && <small>Conversa entre {item.conversation.owner.name} e {item.conversation.interested.name}</small>}<p>{item.reason}</p><small>{item.assignedAdmin ? `Atendimento por ${item.assignedAdmin.name}` : 'Aguardando alguém da Equipe de apoio assumir'}</small>{item.resolution && <blockquote><strong>Orientação da equipe:</strong> {item.resolution}</blockquote>}</div><small>{formatDateTime(item.requestedAt)}</small></article>)}</div>
  </div>
}

function formatDateTime(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
