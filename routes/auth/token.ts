import type {
  AuthCodeData,
  OAuthServiceRegisterClientResponse,
} from '~/lib/auth'
import { OAuthServiceHandleTokenRequestSchema } from '~/lib/auth'
import { getAuthProvider } from '~/plugins/mcp'

export default defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    })
  }

  logger.info('Requesting new token')
  const request = await readValidatedBody(event, OAuthServiceHandleTokenRequestSchema.parse)

  // Check for grant_type
  if (request.grant_type !== 'authorization_code') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported grant_type',
    })
  }

  // Check for required parameters
  if (!request.code || !request.client_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters',
    })
  }

  // Verify the client
  const registeredClient
  = await useStorage('registrationStore')
    .getItem<OAuthServiceRegisterClientResponse>(request.client_id)
  if (!registeredClient) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid client',
    })
  }

  // Verify client secret if provided
  if (request.client_secret && registeredClient.client_secret !== request.client_secret) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid client credentials',
    })
  }

  // Verify the authorization code
  // Use a slice to ensure we don't exceed storage limits
  const authCodeData
  = await useStorage('authCodeStore')
    .getItem<AuthCodeData>(request.code.slice(0, 255))

  if (!authCodeData || authCodeData.client_id !== request.client_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid authorization code',
    })
  }

  // Check expiration date
  if (Date.now() > authCodeData.expires_at) {
    await useStorage('authCodeStore').removeItem(request.code.slice(0, 255))
    throw createError({
      statusCode: 400,
      statusMessage: 'Authorization code expired',
    })
  }

  // Exchange the code with the provider
  const tokenResponse = await getAuthProvider().exchangeCodeForToken(
    request.code,
    authCodeData.code_verifier,
  )

  // Clean up the authorization code
  await useStorage('authCodeStore').removeItem(request.code.slice(0, 255))

  return tokenResponse
})
