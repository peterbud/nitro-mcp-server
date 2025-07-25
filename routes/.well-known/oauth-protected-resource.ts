import { getAuthProvider } from '~/plugins/mcp'

export default defineEventHandler(async (event) => {
  if (event.method === 'OPTIONS') {
    return ''
  }

  logger.info('Fetching OAuth Protected Resource details')
  return await getAuthProvider().getProtectedResource()
})
