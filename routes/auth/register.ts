import type { OAuthServiceRegisterClientResponse } from '~/lib/auth'
import { randomBytes } from 'node:crypto'
import { OAuthServiceRegisterClientRequestSchema } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  // Handle CORS preflight requests
  if (event.method === 'OPTIONS') {
    return ''
  }

  logger.info('Registering a new client application')
  const request = await readValidatedBody(event, OAuthServiceRegisterClientRequestSchema.parse)

  const clientId = request.client_id ?? `mcp_${randomBytes(16).toString('hex')}`
  const clientSecret = randomBytes(32).toString('hex')

  const registeredClient: OAuthServiceRegisterClientResponse = {
    client_id: clientId,
    client_secret: clientSecret,
    client_id_issued_at: Date.now(),
    client_secret_expires_at: 0,
    application_type: 'web',
    redirect_uris: request.redirect_uris,
    client_name: request.client_name ?? `MCP Client ${request.client_id}`,
    scope: request.scope ?? '',
    grant_types: request.grant_types ?? ['authorization_code'],
    response_types: request.response_types ?? ['code'],
    token_endpoint_auth_method: request.token_endpoint_auth_method ?? 'client_secret_post',
  }

  await useStorage('registrationStore').setItem<OAuthServiceRegisterClientResponse>(clientId, registeredClient)

  logger.info('Client registered successfully', registeredClient.client_id)

  return registeredClient
})
