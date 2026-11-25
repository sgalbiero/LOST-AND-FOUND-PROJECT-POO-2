import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Report } from '../domain/Moderation'
import { useModeration } from './ModerationContext'
import { formatDateTime } from '../../../shared/ui/format'

export function SupportReportsPage() {
  const service = useModeration()
  const [items, setItems] = useState<Report[]>([])
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const load = useCallback((signal?: AbortSignal) => service.listReports(false, signal).then(setItems), [service])
  useEffect(() => { const controller = new AbortController(); load(controller.signal).catch(cause => { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause.message) }); return () => controller.abort() }, [load])
  async function resolve(id: number) { setError(''); try { await service.resolveReport(id); setFeedback('Denúncia resolvida.'); await load() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível resolver a denúncia.') } }
  return <div className="page-container moderation-page"><header className="dashboard-header"><div><Link className="section-back" to="/admin">← Painel da equipe</Link><span className="eyebrow">Segurança</span><h1>Denúncias</h1><p>Analise o conteúdo e o motivo antes de registrar a resolução.</p></div></header>{feedback && <div className="success-banner" role="status">{feedback}</div>}{error && <div className="form-error" role="alert">{error}</div>}<section className="admin-section"><h2>Pendentes ({items.length})</h2>{items.length === 0 ? <p>Nenhuma denúncia pendente.</p> : items.map(item => <article className="admin-row" key={item.id}><div>{item.itemId ? <Link className="report-target" to={`/itens/${item.itemId}`}><strong>{item.itemTitle ?? `Item #${item.itemId}`}</strong><span>Ver publicação →</span></Link> : item.conversationId ? <Link className="report-target" to={`/mensagens?conversa=${item.conversationId}`}><strong>Mensagem #{item.messageId}</strong><span>Abrir conversa →</span></Link> : <strong>Mensagem #{item.messageId}</strong>}{item.messageContent && <blockquote>“{item.messageContent}”</blockquote>}<p><strong>Motivo informado:</strong> {item.reason}</p><div className="report-meta"><small>Enviada por {item.reporter.name}</small><small>{formatDateTime(item.createdAt)}</small></div></div><button className="button button-secondary" onClick={() => void resolve(item.id)}>Marcar como resolvida</button></article>)}</section></div>
}
