import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../auth/presentation/AuthContext'
import type { ManagedOption, Mediation, Report } from '../domain/Moderation'
import { useModeration } from './ModerationContext'

export function AdminPage() {
  const { user } = useAuth()
  const service = useModeration()
  const [reports, setReports] = useState<Report[]>([])
  const [mediations, setMediations] = useState<Mediation[]>([])
  const [categories, setCategories] = useState<ManagedOption[]>([])
  const [locations, setLocations] = useState<ManagedOption[]>([])
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [reload, setReload] = useState(0)

  const load = useCallback((signal?: AbortSignal) => Promise.all([service.listReports(false, signal), service.listOpenMediations(signal), service.listCategories(signal), service.listLocations(signal)]).then(([r, m, c, l]) => { setReports(r); setMediations(m); setCategories(c); setLocations(l) }), [service])
  useEffect(() => { const controller = new AbortController(); load(controller.signal).catch(cause => { if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(cause.message) }); return () => controller.abort() }, [load, reload])
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />

  async function act(work: () => Promise<unknown>, message: string) { setError(''); setFeedback(''); try { await work(); setFeedback(message); setReload(value => value + 1) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível concluir a ação.') } }
  async function createOption(event: FormEvent<HTMLFormElement>, type: 'category' | 'location') { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); await act(() => type === 'category' ? service.createCategory(String(data.get('nome'))) : service.createLocation(String(data.get('nome')), String(data.get('descricao') || '')), `${type === 'category' ? 'Categoria' : 'Local'} criado.`); form.reset() }

  return <div className="page-container moderation-page"><header className="dashboard-header"><div><span className="eyebrow">Operação segura</span><h1>Administração</h1><p>Modere solicitações e mantenha o catálogo organizado.</p></div></header>
    {feedback && <div className="success-banner" role="status">{feedback}</div>}{error && <div className="form-error" role="alert">{error}</div>}
    <AdminSection title={`Denúncias pendentes (${reports.length})`}>{reports.length === 0 ? <p>Nenhuma denúncia pendente.</p> : reports.map(report => <article className="admin-row" key={report.id}><div><strong>{report.itemId ? `Item #${report.itemId}` : `Mensagem #${report.messageId}`}</strong><p>{report.reason}</p><small>Por {report.reporter.name}</small></div><button className="button button-secondary" onClick={() => act(() => service.resolveReport(report.id), 'Denúncia resolvida.')}>Resolver</button></article>)}</AdminSection>
    <AdminSection title={`Mediações abertas (${mediations.length})`}>{mediations.length === 0 ? <p>Nenhuma mediação aberta.</p> : mediations.map(mediation => <article className="admin-row" key={mediation.id}><div><strong>{mediation.itemTitle}</strong><p>{mediation.reason}</p><small>{mediation.assignedAdmin ? `Responsável: ${mediation.assignedAdmin.name}` : 'Ainda não atribuída'}</small></div><div className="admin-actions">{!mediation.assignedAdmin && <button className="button button-secondary" onClick={() => act(() => service.assignMediation(mediation.id), 'Mediação atribuída a você.')}>Assumir</button>}{mediation.assignedAdmin?.id === user.id && <button className="button button-primary" onClick={() => { const value = prompt('Parecer final da mediação:'); if (value) void act(() => service.resolveMediation(mediation.id, value), 'Mediação resolvida.') }}>Resolver</button>}</div></article>)}</AdminSection>
    <div className="admin-columns"><OptionSection title="Categorias" values={categories} onCreate={event => createOption(event, 'category')} onToggle={(id, active) => act(() => service.toggleCategory(id, active), 'Categoria atualizada.')} /><OptionSection title="Locais" values={locations} withDescription onCreate={event => createOption(event, 'location')} onToggle={(id, active) => act(() => service.toggleLocation(id, active), 'Local atualizado.')} /></div>
  </div>
}

function AdminSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="admin-section"><h2>{title}</h2>{children}</section> }
function OptionSection({ title, values, withDescription, onCreate, onToggle }: { title: string; values: ManagedOption[]; withDescription?: boolean; onCreate(event: FormEvent<HTMLFormElement>): void; onToggle(id: number, active: boolean): void }) { return <AdminSection title={title}><form className="admin-create" onSubmit={onCreate}><input name="nome" placeholder="Nome" maxLength={255} required />{withDescription && <input name="descricao" placeholder="Descrição (opcional)" />}<button className="button button-primary">Adicionar</button></form>{values.map(value => <div className="admin-row compact" key={value.id}><div><strong>{value.name}</strong>{value.description && <small>{value.description}</small>}</div><button className="button button-ghost" onClick={() => onToggle(value.id, !value.active)}>{value.active ? 'Desativar' : 'Ativar'}</button></div>)}</AdminSection> }
