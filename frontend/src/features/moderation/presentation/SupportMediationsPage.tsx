import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/presentation/AuthContext'
import type { Mediation } from '../domain/Moderation'
import { useModeration } from './ModerationContext'
import { TextDialog } from '../../../shared/ui/Dialog'

export function SupportMediationsPage() {
  const { user } = useAuth()
  const service = useModeration()
  const [items, setItems] = useState<Mediation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const [resolving, setResolving] = useState<Mediation | null>(null)
  const [saving, setSaving] = useState(false)
  const load = useCallback(async (signal?: AbortSignal, showLoading = false) => { if (showLoading) setLoading(true); try { setItems(await service.listOpenMediations(signal)); setError(''); setUpdatedAt(new Date()) } catch (cause) { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os pedidos.') } finally { if (!signal?.aborted) setLoading(false) } }, [service])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal, true); const timer = window.setInterval(() => void load(controller.signal), 10000); return () => { controller.abort(); window.clearInterval(timer) } }, [load])
  async function act(work: () => Promise<unknown>, message: string) { setError(''); setFeedback(''); try { await work(); setFeedback(message); await load() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível concluir a ação.') } }
  async function resolve(value: string) { if (!resolving) return; setSaving(true); await act(() => service.resolveMediation(resolving.id, value), 'Mediação resolvida e orientação registrada.'); setSaving(false); setResolving(null) }
  return <div className="page-container moderation-page"><header className="dashboard-header"><div><Link className="section-back" to="/admin">← Painel da equipe</Link><span className="eyebrow">Atendimento</span><h1>Pedidos de ajuda</h1><p>Assuma um pedido para participar da conversa como mediador.</p>{updatedAt && <small>Atualizado às {updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small>}</div><button className="button button-secondary" disabled={loading} onClick={() => void load(undefined, true)}>{loading ? 'Atualizando...' : 'Atualizar'}</button></header>{feedback && <div className="success-banner" role="status">{feedback}</div>}{error && <div className="form-error" role="alert">{error}</div>}<section className="admin-section"><h2>Fila aberta ({items.length})</h2>{loading ? <p>Carregando pedidos...</p> : items.length === 0 ? <p>Nenhum pedido aguardando atendimento.</p> : items.map(item => <article className="admin-row mediation-admin-row" key={item.id}><div><span className={`status status-${item.status.toLowerCase()}`}>{item.status === 'PENDENTE' ? 'Aguardando atendimento' : 'Em atendimento'}</span><strong><Link to={`/itens/${item.itemId}`}>{item.itemTitle}</Link></strong>{item.conversation && <small>Conversa entre {item.conversation.owner.name} e {item.conversation.interested.name}</small>}<p>{item.reason}</p><small>Solicitado por {item.requester.name} em {formatDateTime(item.requestedAt)}</small><small>{item.assignedAdmin ? `Mediador responsável: ${item.assignedAdmin.name}` : 'Ainda não atribuído'}</small></div><div className="admin-actions">{!item.assignedAdmin && <button className="button button-secondary" onClick={() => act(() => service.assignMediation(item.id), 'Mediação assumida. Você já pode entrar na conversa.')}>Assumir mediação</button>}{item.assignedAdmin?.id === user?.id && item.conversation && <Link className="button button-secondary" to={`/mensagens?conversa=${item.conversation.id}`}>Entrar na conversa</Link>}{item.assignedAdmin?.id === user?.id && <button className="button button-primary" onClick={() => setResolving(item)}>Registrar solução</button>}</div></article>)}</section>{resolving && <TextDialog title="Registrar solução" description={`Escreva a orientação final para o pedido sobre “${resolving.itemTitle}”.`} label="Orientação para os participantes" submitLabel="Concluir mediação" maxLength={2000} busy={saving} onClose={() => setResolving(null)} onSubmit={resolve} />}</div>
}

function formatDateTime(value: string) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
