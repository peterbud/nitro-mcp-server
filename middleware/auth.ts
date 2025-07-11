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

    //
    // event.context.auth = { ...apiToken }
  }
})
