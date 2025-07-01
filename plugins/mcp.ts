import type { Tool } from '~/types'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { echoTool } from '~/lib/tools/echo'
import { getPostsByUserTool } from '~/lib/tools/getPostsByUser'
import { logger } from '~/utils/logger'

// Define an array of tools to register
const tools: Tool<any, any>[] = [
  echoTool,
  getPostsByUserTool,
  // Add more tools here as needed
]

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

  for (const tool of tools) {
    server.registerTool(tool.name, tool.options, tool.handler)
  }

  logger.info('Registering MCP server tools')
})
