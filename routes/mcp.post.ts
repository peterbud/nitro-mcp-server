import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js'
import type { IncomingMessage } from 'node:http'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { getServer } from '~/plugins/mcp'

interface MCPRequestWithAuth extends IncomingMessage {
  auth?: AuthInfo
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const server = getServer()
  const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  })

  await server.connect(transport)

  // Ensure auth info is available in the MCP transport
  const mcpReq = event.node.req as MCPRequestWithAuth
  if (!mcpReq.auth)
    mcpReq.auth = {} as AuthInfo
  mcpReq.auth = { ...event.context.auth }

  return transport.handleRequest(mcpReq, event.node.res, body)
})
