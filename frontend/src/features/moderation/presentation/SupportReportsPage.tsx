import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Report } from '../domain/Moderation'
import { useModeration } from './ModerationContext'

export function SupportReportsPage() {
  const service = useModeration()
  const [items, setItems] = useState<Report[]>([])
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const load = useCallback((signal?: AbortSignal) => service.listReports(false, signal).then(setItems), [service])
  useEffect(() => { const controller = new AbortController(); load(controller.signal).catch(cause => { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause.message) }); return () => controller.abort() }, [load])
  async function resolve(id: number) { setError(''); try { await service.resolveReport(id); setFeedback('Denúncia resolvida.'); await load() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível resolver a denúncia.') } }
  return <div className="page-container moderation-page"><header className="dashboard-header"><div><Link className="section-back" to="/admin">← Painel da equipe</Link><span className="eyebrow">Segurança</span><h1>Denúncias</h1><p>Analise os conteúdos sinalizados pelos usuários.</p></div></header>{feedback && <div className="success-banner">{feedback}</div>}{error && <div className="form-error">{error}</div>}<section className="admin-section"><h2>Pendentes ({items.length})</h2>{items.length === 0 ? <p>Nenhuma denúncia pendente.</p> : items.map(item => <article className="admin-row" key={item.id}><div><strong>{item.itemId ? `Item #${item.itemId}` : `Mensagem #${item.messageId}`}</strong><p>{item.reason}</p><small>Enviada por {item.reporter.name}</small></div><button className="button button-secondary" onClick={() => void resolve(item.id)}>Marcar como resolvida</button></article>)}</section></div>
}
