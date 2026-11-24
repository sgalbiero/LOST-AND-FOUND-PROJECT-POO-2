import { ApiError } from './ApiError'
import type { CredentialProvider, HttpClient, HttpRequest } from './HttpClient'

interface ApiErrorDto {
  mensagem?: string
  campos?: Record<string, string>
}

export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly credentials: CredentialProvider,
  ) {}

  async request<T>(path: string, request: HttpRequest = {}): Promise<T> {
    const headers = new Headers(request.headers)
    headers.set('Accept', 'application/json')
    if (request.body !== undefined) headers.set('Content-Type', 'application/json')
    const authorization = this.credentials.getAuthorization()
    if (authorization && !headers.has('Authorization')) headers.set('Authorization', authorization)

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: request.method ?? 'GET',
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
      headers,
      signal: request.signal,
    })

    if (!response.ok) {
      if (response.status === 401 && authorization) this.credentials.expire()
      throw await this.toError(response)
    }
    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  private async toError(response: Response) {
    let body: ApiErrorDto = {}
    try { body = await response.json() } catch { /* Resposta vazia ou fora do contrato. */ }
    return new ApiError(body.mensagem ?? defaultMessage(response.status), response.status, body.campos)
  }
}

function defaultMessage(status: number) {
  if (status === 401) return 'E-mail ou senha inválidos.'
  if (status === 403) return 'Você não tem permissão para realizar esta ação.'
  if (status === 404) return 'Não encontramos o conteúdo solicitado.'
  if (status === 429) return 'Muitas tentativas. Aguarde um minuto e tente novamente.'
  return 'Não foi possível concluir a operação. Tente novamente.'
}
