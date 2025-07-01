import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { getServer } from '~/plugins/mcp'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const server = getServer()
  const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  await server.connect(transport)
  return transport.handleRequest(event.node.req, event.node.res, body)
})
