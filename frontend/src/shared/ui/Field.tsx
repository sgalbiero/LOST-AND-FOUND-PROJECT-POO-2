import { useId, type InputHTMLAttributes } from 'react'

export function Field({ label, error, hint, id, 'aria-describedby': describedBy, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const supportId = `${inputId}-support`
  const description = [describedBy, (error || hint) ? supportId : undefined].filter(Boolean).join(' ') || undefined
  return (
    <label htmlFor={inputId}>
      <span>{label}</span>
      <input {...props} id={inputId} aria-invalid={error ? true : undefined} aria-describedby={description} />
      {error && <small id={supportId} className="field-error">{error}</small>}
      {hint && !error && <small id={supportId}>{hint}</small>}
    </label>
  )
}
