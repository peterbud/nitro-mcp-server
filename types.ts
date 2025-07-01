import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { ZodRawShape } from 'zod'

// Define the type for a tool matching MCP registerTool signature
export interface Tool<InputArgs extends ZodRawShape, OutputArgs extends ZodRawShape | undefined = undefined> {
  name: string
  options: {
    title?: string
    description?: string
    inputSchema?: InputArgs
    outputSchema?: OutputArgs
    annotations?: any
  }
  handler: OutputArgs extends undefined
    ? ToolCallback<InputArgs>
    : (args: any) => Promise<{ structuredContent: any }>
}
