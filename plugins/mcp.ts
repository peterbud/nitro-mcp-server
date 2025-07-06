import type { ResourceDefinition, Tool } from '~/types'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { savePostsOfUserPrompt } from '~/lib/prompts/savePostsOfUser'
import { postResource } from '~/lib/resources/postResource'
import { userResource } from '~/lib/resources/userResource'
import { echoTool } from '~/lib/tools/echo'
import { getPostsByUserTool } from '~/lib/tools/getPostsByUser'
import { logger } from '~/utils/logger'

// Define an array of tools to register
const tools: Tool<any, any>[] = [
  echoTool,
  getPostsByUserTool,
  // Add more tools here as needed
]

const resources: ResourceDefinition[] = [
  postResource,
  userResource,
  // Add more resources here as needed
]

const prompts = [
  savePostsOfUserPrompt,
  // Add more prompts here as needed
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
      resources: {},
      prompts: {},
    },
  })

  for (const tool of tools) {
    server.registerTool(tool.name, tool.options, tool.handler)
  }

  for (const resource of resources) {
    server.registerResource(resource.name, resource.uriOrTemplate, resource.config, resource.readCallback)
  }

  for (const prompt of prompts) {
    server.registerPrompt(prompt.name, prompt.options, prompt.cb)
  }
  logger.info('Registering MCP server tools')
})
