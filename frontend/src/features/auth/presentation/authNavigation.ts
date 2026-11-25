export function safeReturnPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/'
  return value
}

export function loginPath(returnPath: string) {
  return `/entrar?retorno=${encodeURIComponent(safeReturnPath(returnPath))}`
}
