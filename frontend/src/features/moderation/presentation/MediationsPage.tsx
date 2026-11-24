import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { Mediation } from '../domain/Moderation'
import { useModeration } from './ModerationContext'

const labels = { PENDENTE: 'Pendente', EM_ANDAMENTO: 'Em andamento', RESOLVIDO: 'Resolvida' }

export function MediationsPage() {
  const service = useModeration()
  const [params, setParams] = useSearchParams()
  const itemId = Number(params.get('item'))
  const [items, setItems] = useState<Mediation[]>([])
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [reload, setReload] = useState(0)

  useEffect(() => { const controller = new AbortController(); service.listMyMediations(controller.signal).then(setItems).catch(cause => { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause.message) }); return () => controller.abort() }, [reload, service])

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setFeedback('')
    try { await service.requestMediation(itemId, reason); setReason(''); setParams({}); setFeedback('Solicitação de mediação enviada.'); setReload(value => value + 1) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível solicitar a mediação.') }
    finally { setBusy(false) }
  }

  return <div className="page-container moderation-page"><header className="dashboard-header"><div><span className="eyebrow">Apoio da equipe</span><h1>Minhas mediações</h1><p>Acompanhe solicitações em que um administrador ajuda a resolver a situação.</p></div></header>
    {Number.isInteger(itemId) && itemId > 0 && <form className="form item-form moderation-composer" onSubmit={submit}><h2>Solicitar mediação</h2><p>Explique de forma objetiva por que a equipe deve intervir.</p><label><span>Motivo</span><textarea rows={5} maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} required /></label><div className="form-actions"><button type="button" className="button button-ghost" onClick={() => setParams({})}>Cancelar</button><button className="button button-primary" disabled={busy}>{busy ? 'Enviando...' : 'Enviar solicitação'}</button></div></form>}
    {feedback && <div className="success-banner" role="status">{feedback}</div>}{error && <div className="form-error" role="alert">{error}</div>}
    <div className="moderation-list">{items.length === 0 ? <p>Nenhuma mediação solicitada.</p> : items.map(item => <article className="admin-card" key={item.id}><div><span className={`status status-${item.status.toLowerCase()}`}>{labels[item.status]}</span><h2><Link to={`/itens/${item.itemId}`}>{item.itemTitle}</Link></h2><p>{item.reason}</p>{item.resolution && <blockquote><strong>Parecer:</strong> {item.resolution}</blockquote>}</div><small>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.requestedAt))}</small></article>)}</div>
  </div>
}
