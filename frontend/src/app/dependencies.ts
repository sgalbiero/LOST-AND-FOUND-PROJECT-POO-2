import { CatalogService } from '../features/catalog/application/CatalogService'
import { HttpCatalogGateway } from '../features/catalog/infrastructure/HttpCatalogGateway'
import { AuthService } from '../features/auth/application/AuthService'
import { HttpAuthGateway } from '../features/auth/infrastructure/HttpAuthGateway'
import { ClaimService } from '../features/claims/application/ClaimService'
import { HttpClaimGateway } from '../features/claims/infrastructure/HttpClaimGateway'
import { ItemService } from '../features/items/application/ItemService'
import { HttpItemRepository } from '../features/items/infrastructure/HttpItemRepository'
import { MessageService } from '../features/messages/application/MessageService'
import { HttpMessageGateway } from '../features/messages/infrastructure/HttpMessageGateway'
import { ReturnService } from '../features/returns/application/ReturnService'
import { HttpReturnGateway } from '../features/returns/infrastructure/HttpReturnGateway'
import { ModerationService } from '../features/moderation/application/ModerationService'
import { HttpModerationGateway } from '../features/moderation/infrastructure/HttpModerationGateway'
import { FetchHttpClient } from '../shared/http/FetchHttpClient'
import { SessionCredentialStore } from '../shared/session/SessionCredentialStore'

const credentials = new SessionCredentialStore()
const http = new FetchHttpClient(import.meta.env.VITE_API_BASE_URL ?? '', credentials)

export const services = Object.freeze({
  auth: new AuthService(new HttpAuthGateway(http), credentials),
  items: new ItemService(new HttpItemRepository(http)),
  catalog: new CatalogService(new HttpCatalogGateway(http)),
  claims: new ClaimService(new HttpClaimGateway(http)),
  messages: new MessageService(new HttpMessageGateway(http)),
  returns: new ReturnService(new HttpReturnGateway(http)),
  moderation: new ModerationService(new HttpModerationGateway(http)),
})

export type Services = typeof services
