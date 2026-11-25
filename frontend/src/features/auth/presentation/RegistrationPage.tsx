import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../../shared/http/ApiError'
import { Field } from '../../../shared/ui/Field'
import { useAuth } from './AuthContext'
import { AuthPage } from './AuthPage'
import { safeReturnPath } from './authNavigation'

export function RegistrationPage() {
  const { user, initializing, register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const returnPath = safeReturnPath(params.get('retorno'))
  if (initializing) return <div className="page-container detail-skeleton skeleton" aria-label="Restaurando sessão" />
  if (user) return <Navigate to={returnPath} replace />

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (data.get('senha') !== data.get('confirmacao')) { setFields({ confirmacao: 'As senhas precisam ser iguais.' }); return }
    setSubmitting(true); setError(''); setFields({})
    try {
      await register({
        name: String(data.get('nome')),
        email: String(data.get('email')),
        phone: String(data.get('telefone') || ''),
        password: String(data.get('senha')),
      })
      navigate(returnPath, { replace: true })
    } catch (cause) {
      if (cause instanceof ApiError) setFields(cause.fields)
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar a conta.')
    } finally { setSubmitting(false) }
  }

  return (
    <AuthPage title="Faça parte da comunidade" description="Uma conta é tudo que você precisa para começar a ajudar.">
      <form className="form" onSubmit={submit}>
        {error && <div className="form-error" role="alert">{error}</div>}
        <Field label="Nome completo" name="nome" autoComplete="name" error={fields.nome} required />
        <Field label="E-mail" name="email" type="email" autoComplete="email" error={fields.email} required />
        <Field label="Telefone (opcional)" name="telefone" type="tel" inputMode="tel" autoComplete="tel" error={fields.telefone} />
        <Field label="Senha" name="senha" type="password" autoComplete="new-password" minLength={8} error={fields.senha} hint="Use pelo menos 8 caracteres." required />
        <Field label="Confirmar senha" name="confirmacao" type="password" autoComplete="new-password" error={fields.confirmacao} required />
        <button className="button button-primary button-wide" disabled={submitting}>{submitting ? 'Criando conta...' : 'Criar minha conta'}</button>
        <p className="form-switch">Já tem conta? <Link to={`/entrar${returnPath !== '/' ? `?retorno=${encodeURIComponent(returnPath)}` : ''}`}>Entrar</Link></p>
      </form>
    </AuthPage>
  )
}
