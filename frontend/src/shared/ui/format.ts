export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })
    .format(new Date(`${value}T12:00:00Z`))
}

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function localDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}
