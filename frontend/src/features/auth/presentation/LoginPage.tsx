import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Field } from '../../../shared/ui/Field'
import { useAuth } from './AuthContext'
import { AuthPage } from './AuthPage'
import { safeReturnPath } from './authNavigation'

export function LoginPage() {
  const { user, initializing, signIn } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const returnPath = safeReturnPath(params.get('retorno'))
  if (initializing) return <div className="page-container detail-skeleton skeleton" aria-label="Restaurando sessão" />
  if (user) return <Navigate to={returnPath} replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setSubmitting(true); setError('')
    try {
      await signIn(String(data.get('email')), String(data.get('senha')))
      navigate(returnPath, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.')
    } finally { setSubmitting(false) }
  }

  return (
    <AuthPage title="Que bom ter você de volta" description="Entre para publicar, conversar e acompanhar seus itens.">
      <form className="form" onSubmit={submit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <Field label="E-mail" name="email" type="email" autoComplete="email" required />
        <Field label="Senha" name="senha" type="password" autoComplete="current-password" required />
        <button className="button button-primary button-wide" disabled={submitting}>{submitting ? 'Entrando...' : 'Entrar'}</button>
        <p className="form-switch">Ainda não tem conta? <Link to={`/cadastro${returnPath !== '/' ? `?retorno=${encodeURIComponent(returnPath)}` : ''}`}>Criar conta</Link></p>
      </form>
    </AuthPage>
  )
}
