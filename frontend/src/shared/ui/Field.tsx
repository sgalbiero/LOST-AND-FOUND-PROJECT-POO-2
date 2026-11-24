import type { InputHTMLAttributes } from 'react'

export function Field({ label, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  return (
    <label>
      <span>{label}</span>
      <input {...props} aria-invalid={Boolean(error)} />
      {error && <small className="field-error">{error}</small>}
      {hint && !error && <small>{hint}</small>}
    </label>
  )
}
