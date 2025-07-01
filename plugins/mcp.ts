import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { echoTool } from '~/lib/tools/echo'
import { logger } from '~/utils/logger'

let server: McpServer | null = null

export function getServer() {
  if (!server) {
    throw new Error('MCP server is not initialized')
  }
  return server
}

export default defineNitroPlugin(async () => {
  server = new McpServer({
    name: 'demo-server',
    version: '1.0.0',
  }, {
    capabilities: {
      tools: {},
    },
  })

  server.registerTool(
    echoTool.name,
    echoTool.options,
    echoTool.handler,
  )

  logger.info('Registering MCP server tools')
})
