export interface HttpRequest {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface HttpClient {
  request<T>(path: string, request?: HttpRequest): Promise<T>
}

export interface CredentialProvider {
  getAuthorization(): string | null
  expire(): void
}
