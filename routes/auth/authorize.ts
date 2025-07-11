import type {
  AuthCodeData,
  OAuthServiceHandleAuthorizationRequest,
  OAuthServiceRegisterClientResponse,
} from '~/lib/auth'
import { randomBytes } from 'node:crypto'
import { getAuthProvider } from '~/plugins/mcp'
import { generatePkce } from '~/utils/pkce'

export default defineEventHandler(async (event) => {
  const params = getQuery<OAuthServiceHandleAuthorizationRequest>(event)

  logger.info('Authorization request received')
  if (!params.client_id || !params.redirect_uri || !params.response_type) {
    logger.error('Authorization error: Missing required parameters')
    throw createError({
      statusCode: 400,
      statusMessage: 'Authorization error',
      data: {
        error: 'invalid_request',
        description: 'Missing required parameters',
      },
    })
  }

  // Verify client exists in our registration store
  const registeredClient
    = await useStorage('registrationStore')
      .getItem<OAuthServiceRegisterClientResponse>(params.client_id)

  if (!registeredClient) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid client_id',
    })
  }

  // validate client data with the params
  if (registeredClient && !registeredClient.redirect_uris.includes(params.redirect_uri)) {
    throw new Error('Redirect URI not found')
  }

  if (registeredClient && !registeredClient.response_types.includes('code')) {
    throw new Error('Response type not supported')
  }

  // Generate our own PKCE values instead of using client's
  const pkce = generatePkce()

  // Generate a secure random state parameter
  const state = randomBytes(32).toString('hex')

  // Store both the client's original state and our generated state
  const authCodeData: AuthCodeData = {
    state,
    client_id: params.client_id,
    code_verifier: pkce.verifier,
    original_state: params.state as string, // Store client's original state
    original_redirect_uri: params.redirect_uri as string,
    original_client_code_challenge: params.code_challenge as string,
    original_client_code_challenge_method: params.code_challenge_method ?? 'S256',
    created_at: Date.now(),
    expires_at: Date.now() + 60 * 10 * 1000, // 10 minutes expiration
  }

  await useStorage('authCodeStore').setItem<AuthCodeData>(state, authCodeData)

  const authUrl = await getAuthProvider()
    .getAuthorizationUrl(params, state, pkce.challenge)
  return sendRedirect(event, authUrl, 302)
})
