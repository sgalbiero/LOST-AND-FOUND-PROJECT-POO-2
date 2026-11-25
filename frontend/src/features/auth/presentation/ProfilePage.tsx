import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Field } from '../../../shared/ui/Field'
import { formatDate } from '../../../shared/ui/format'
import { useAuth } from './AuthContext'
import { ConfirmDialog } from '../../../shared/ui/Dialog'

export function ProfilePage() {
  const { user, updateProfile, deactivate } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
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
        <Field label="Nome completo" name="nome" autoComplete="name" defaultValue={user.name} maxLength={255} required />
        <Field label="E-mail" name="email" type="email" autoComplete="email" value={user.email} readOnly />
        <Field label="Telefone (opcional)" name="telefone" type="tel" inputMode="tel" autoComplete="tel" defaultValue={user.phone} maxLength={50} />
        <div className="form-actions"><button className="button button-primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar perfil'}</button></div>
      </form>
      <aside className="profile-summary"><h2>Informações da conta</h2><dl><div><dt>Perfil</dt><dd>{user.role === 'ADMIN' ? 'Equipe de apoio' : 'Aluno'}</dd></div><div><dt>Cadastro</dt><dd>{formatDate(user.registeredAt)}</dd></div><div><dt>Status</dt><dd>{user.active ? 'Ativa' : 'Desativada'}</dd></div></dl><hr /><h3>Desativar conta</h3><p>Suas publicações e conversas serão preservadas. Para recuperar o acesso, solicite a reativação à equipe de apoio.</p><button className="button button-secondary" disabled={busy} onClick={() => setDeactivateOpen(true)}>Desativar minha conta</button></aside>
    </div>
    {deactivateOpen && <ConfirmDialog title="Desativar sua conta?" description="Você perderá o acesso, mas publicações e conversas serão preservadas. A equipe de apoio poderá reativar a conta." confirmLabel="Desativar conta" danger busy={busy} onClose={() => setDeactivateOpen(false)} onConfirm={removeAccount} />}
  </div>
}
