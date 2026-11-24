import type { ReactNode } from 'react'

export function AuthPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="auth-page">
      <section className="auth-copy">
        <span className="eyebrow">Reencontra</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <blockquote>“Cada objeto devolvido é uma pequena história que encontra o caminho de volta.”</blockquote>
      </section>
      <section className="auth-card">{children}</section>
    </div>
  )
}
