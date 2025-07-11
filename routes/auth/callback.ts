import type {
  AuthCodeData,
} from '~/lib/auth'

export default defineEventHandler(async (event) => {
  if (event.method === 'OPTIONS') {
    return ''
  }

  interface OAuthCallbackParams {
    code: string
    state: string
    session_state?: string
    client_info?: string
    error?: string
  }

  const params = getQuery<OAuthCallbackParams>(event)
  logger.info('Callback request received')

  if (params.error) {
    logger.error('OAuth callback error:', params.error)
    throw createError({
      statusCode: 400,
      statusMessage: `OAuth error: ${params.error}`,
    })
  }

  if (!params.code || !params.state) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing code or state parameter',
    })
  }

  if (!params.code || !params.state) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing code or state parameter',
    })
  }

  const authCodeData = await useStorage('authCodeStore').getItem<AuthCodeData>(params.state)
  if (!authCodeData) {
    logger.error('No auth code data found for state:', params.state)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid state parameter',
    })
  }

  // Redirect back to the original client with the received code
  const redirectUri = new URL(authCodeData.original_redirect_uri)
  redirectUri.searchParams.set('code', params.code)
  redirectUri.searchParams.set('state', authCodeData.original_state)

  // delete authCode data - not needed anymore
  await useStorage('authCodeStore').removeItem(params.state)

  // save the authCodeData under the received code, to be able to look it up later
  // slice the code to ensure we don't exceed storage limits
  await useStorage('authCodeStore').setItem<AuthCodeData>(params.code.slice(0, 255), authCodeData)
  return sendRedirect(event, redirectUri.toString(), 302)
})
