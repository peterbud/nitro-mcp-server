import type { Tool } from '~/types'
import { z } from 'zod'

const inputSchema = {
  message: z.string(),
}

export const echoTool: Tool<typeof inputSchema, undefined> = {
  name: 'echo',
  options: {
    title: 'Echo Tool',
    description: 'Echoes back the provided message',
    inputSchema,
  },
  handler: async ({ message }) => ({
    content: [{ type: 'text', text: `Tool echo: ${message}` }],
  }),
}
