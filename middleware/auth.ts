import { getAuthProvider } from '~/plugins/mcp'

export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname.startsWith('/mcp')
    && useRuntimeConfig().mcpServer.auth.enabled) {
    // get bearer token from headers
    const authHeader = getHeader(event, 'Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'No authorization token provided',
      })
    }

    const token = authHeader.split(' ')[1]

    try {
      const userInfo = await getAuthProvider().getUserInfoFromToken(token)
      event.context.auth = userInfo
    }
    catch (error) {
      logger.error('Retrieving user info failed', error)
      throw createError({
        status: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid token: Unknown error',
      })
    }
  }
})
