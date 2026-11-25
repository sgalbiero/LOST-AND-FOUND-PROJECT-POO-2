import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Field } from '../../../shared/ui/Field'
import { formatDate } from '../../../shared/ui/format'
import { useAuth } from './AuthContext'

export function ProfilePage() {
  const { user, updateProfile, deactivate } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  if (!user) return null

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true); setError(''); setFeedback('')
    try {
      await updateProfile({ name: String(data.get('nome')), phone: String(data.get('telefone') || '') })
      setFeedback('Perfil atualizado com sucesso.')
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível atualizar o perfil.') }
    finally { setBusy(false) }
  }

  async function removeAccount() {
    if (!confirm('Desativar sua conta? Você perderá o acesso até que a equipe de apoio a reative.')) return
    setBusy(true); setError('')
    try { await deactivate(); navigate('/', { replace: true }) }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível desativar a conta.'); setBusy(false) }
  }

  return <div className="page-container profile-page">
    <header className="dashboard-header"><div><span className="eyebrow">Sua conta</span><h1>Meu perfil</h1><p>Atualize seus dados de contato e acompanhe as informações da conta.</p></div></header>
    <div className="profile-grid">
      <form className="form item-form" onSubmit={submit}>
        {feedback && <div className="success-banner" role="status">{feedback}</div>}
        {error && <div className="form-error" role="alert">{error}</div>}
        <Field label="Nome completo" name="nome" defaultValue={user.name} maxLength={255} required />
        <Field label="E-mail" name="email" value={user.email} readOnly />
        <Field label="Telefone (opcional)" name="telefone" defaultValue={user.phone} maxLength={50} />
        <div className="form-actions"><button className="button button-primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar perfil'}</button></div>
      </form>
      <aside className="profile-summary"><h2>Informações da conta</h2><dl><div><dt>Perfil</dt><dd>{user.role === 'ADMIN' ? 'Equipe de apoio' : 'Aluno'}</dd></div><div><dt>Cadastro</dt><dd>{formatDate(user.registeredAt)}</dd></div><div><dt>Status</dt><dd>{user.active ? 'Ativa' : 'Desativada'}</dd></div></dl><hr /><h3>Desativar conta</h3><p>Suas publicações e conversas serão preservadas para manter o histórico.</p><button className="button button-secondary" disabled={busy} onClick={removeAccount}>Desativar minha conta</button></aside>
    </div>
  </div>
}
