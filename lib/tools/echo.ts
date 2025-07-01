import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

const inputSchema = {
  message: z.string(),
}

export const echoTool = {
  name: 'echo',
  options: {
    title: 'Echo Tool',
    description: 'Echoes back the provided message',
    inputSchema,
  },
  handler: (async ({ message }) => ({
    content: [{ type: 'text', text: `Tool echo: ${message}` }],
  })) as ToolCallback<typeof inputSchema>,
}
