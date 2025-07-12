import type {
  PromptCallback,
  ReadResourceCallback,
  ReadResourceTemplateCallback,
  ResourceMetadata,
  ResourceTemplate,
  ToolCallback,
} from '@modelcontextprotocol/sdk/server/mcp.js'
import type {
  ZodOptional,
  ZodRawShape,
  ZodType,
  ZodTypeDef,
} from 'zod'

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
  handler: ToolCallback<InputArgs>
}

export interface ResourceDefinition {
  name: string
  uriOrTemplate: string | ResourceTemplate
  config: ResourceMetadata
  readCallback: ReadResourceCallback | ReadResourceTemplateCallback
}

interface PromptArgsRawShape {
  [k: string]: ZodType<string, ZodTypeDef, string> | ZodOptional<ZodType<string, ZodTypeDef, string>>
}

export interface PromptDefinition<Args extends PromptArgsRawShape> {
  name: string
  options?: {
    title?: string
    description?: string
    argsSchema?: Args
  }
  cb: PromptCallback<Args>
}
