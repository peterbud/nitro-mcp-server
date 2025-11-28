# Copilot Instructions for Nitro MCP Server

## Project Overview
This is a Model Context Protocol (MCP) server implementation using Nitro framework with streamable HTTP transport. It demonstrates MCP server capabilities including tools, resources, prompts, and pluggable authentication providers.

## Technology Stack
- **Runtime**: Nitro (v2.12.4+)
- **MCP SDK**: @modelcontextprotocol/sdk (v1.17.3+)
- **Validation**: Zod (v3.25.76+)
- **Auth**: JWT with jose library
- **Logger**: consola (v3.4.2+)
- **Package Manager**: pnpm (v10.7.1+)
- **TypeScript**: v5.9.2+
- **ESLint**: @antfu/eslint-config (v5.2.1+)

## Code Style & Conventions

### TypeScript
- Use TypeScript for all source files
- Prefer type imports: `import type { TypeName } from '...'`
- Use Zod schemas for runtime validation
- Define explicit return types for public functions
- Use `interface` for object shapes, `type` for unions/intersections

### Formatting
- Use single quotes for strings
- 2-space indentation
- Follow @antfu/eslint-config rules
- No semicolons (per config)
- Use arrow functions for callbacks
- Prefer const over let

### File Organization
- Group imports by: types, external libraries, internal modules, utilities
- Export reusable types from `~/types.ts`
- Keep route handlers in `routes/` directory
- Place business logic in `lib/` directory
- Utils in `utils/` for reusable helpers
- Plugins in `plugins/` for Nitro plugins
- Middleware in `middleware/` for global handlers

## Architecture Patterns

### MCP Server Structure
The MCP server is initialized in `plugins/mcp.ts`.

1. **Server Initialization**: Create McpServer instance with name, version, and capabilities
2. **Registration**: Register tools, resources, and prompts from arrays
3. **Singleton Pattern**: Export `getServer()` and `getAuthProvider()` for accessing instances

### Tools (in `lib/tools/`)
Tools are MCP functions that can be invoked by clients.

**Key Points**:
- Always validate input with Zod schemas
- Use `structuredContent` for typed outputs when outputSchema is defined
- Always provide fallback `content` array
- Access auth info from second parameter: `{ authInfo }`
- Use `logger` for logging operations
- Add tool to `tools` array in `plugins/mcp.ts`

### Resources (in `lib/resources/`)
Resources provide data that can be read by MCP clients.

**Key Points**:
- Use `ResourceTemplate` for parameterized URIs
- Extract variables from callback parameters
- Always validate required variables
- Use try-catch for external API calls
- Return properly formatted contents array
- Add resource to `resources` array in `plugins/mcp.ts`

### Prompts (in `lib/prompts/`)
Prompts provide pre-configured conversation starters.

**Key Points**:
- Use descriptive Zod schemas with `.describe()` for better UX
- Validate required arguments
- Return structured messages array
- Each message should be actionable
- Add prompt to `prompts` array in `plugins/mcp.ts`

### Authentication

#### Provider Pattern
Authentication uses a factory pattern with pluggable providers:

```typescript
// lib/auth/myProvider.ts
import type { AuthProvider, AuthProviderConfig } from './'

export interface MyProviderConfig extends AuthProviderConfig {
  type: 'myProvider'
  clientId: string
  clientSecret: string
  // provider-specific config
}

export class MyProvider implements AuthProvider {
  constructor(private config: MyProviderConfig) {}
  
  async getUserInfoFromToken(token: string): Promise<any> {
    // Validate token and return user info
  }
  
  getAuthorizationUrl(params: any): string {
    // Build authorization URL
  }
  
  async exchangeCodeForToken(code: string, params: any): Promise<any> {
    // Exchange auth code for tokens
  }
}
```

**Key Points**:
- Implement `AuthProvider` interface
- Add provider to `ProviderFactory` in `lib/auth/factory.ts`
- Configure in `nitro.config.ts` under `mcpServer.auth.providers`
- Use OAuth 2.0 with PKCE for security
- Store registration data in `registrationStore`
- Store auth codes temporarily in `authCodeStore`

#### Auth Middleware
The `middleware/auth.ts` validates bearer tokens for MCP requests:
- Only applies to `/mcp` endpoints when auth is enabled
- Extracts token from Authorization header
- Validates token with configured provider
- Stores auth info in `event.context.auth`
- Available to tools via `authInfo` parameter

### Routes

#### MCP Endpoint (`routes/mcp.post.ts`)
- Handles all MCP protocol messages
- Uses StreamableHTTPServerTransport
- Passes auth context from middleware
- Returns transport-handled response

#### Auth Endpoints (`routes/auth/`)
- `register.ts`: OAuth client registration (DCR)
- `authorize.ts`: OAuth authorization endpoint
- `callback.ts`: OAuth callback handler
- `token.ts`: Token exchange endpoint

**Key Points**:
- Use `defineEventHandler` for all routes
- Validate request bodies with Zod: `readValidatedBody(event, schema.parse)`
- Use `useStorage()` for persisting data
- Return proper HTTP status codes with `createError()`
- Enable CORS with routeRules in config

## Configuration

### Environment Variables (`.env`)
- `NITRO_MCP_SERVER_HOST`: Server host (default: localhost)
- `NITRO_MCP_SERVER_PORT`: Server port (default: 3000)
- `NITRO_MCP_SERVER_AUTH_ENABLED`: Enable auth (true/false)
- `NITRO_MCP_SERVER_AUTH_DEFAULT_PROVIDER`: Default provider (auth0/entra)
- Provider-specific: `NITRO_MCP_SERVER_AUTH_PROVIDERS_<PROVIDER>_*`

### Nitro Config (`nitro.config.ts`)
- Use `defineNitroConfig()` for type safety
- Configure runtime config with env fallbacks
- Enable experimental features: `asyncContext: true`
- Define storage drivers for data persistence
- Set CORS rules under `routeRules`

## Development Workflow

### Adding a New Tool
1. Create file in `lib/tools/myTool.ts`
2. Define input/output schemas with Zod
3. Implement handler with proper types
4. Export as `Tool<InputSchema, OutputSchema>`
5. Add to `tools` array in `plugins/mcp.ts`
6. Test with MCP inspector

### Adding a New Resource
1. Create file in `lib/resources/myResource.ts`
2. Define URI template and variables
3. Implement readCallback with error handling
4. Export as `ResourceDefinition`
5. Add to `resources` array in `plugins/mcp.ts`
6. Test with MCP inspector

### Adding a New Auth Provider
1. Create file in `lib/auth/myProvider.ts`
2. Define config interface extending `AuthProviderConfig`
3. Implement `AuthProvider` interface
4. Add to `ProviderFactory.createProvider()`
5. Add config to `nitro.config.ts`
6. Document in README.md

### Testing
- Use `pnpm dev` for development server
- Use `pnpm inspect` to launch MCP inspector
- Connect inspector to `http://localhost:3000/mcp`
- Test tools, resources, and prompts interactively
- Check logs for debugging

### Building
- Run `pnpm build` for production build
- Output goes to `.output/` directory
- Deploy as Node.js application
- Set production environment variables

## Security Best Practices

1. **Always validate input**: Use Zod schemas for all user inputs
2. **Use PKCE**: For OAuth flows, always use PKCE
3. **Secure tokens**: Never log sensitive tokens or secrets
4. **Rate limiting**: Apply rate limiting to auth endpoints (future TODO)
5. **CORS**: Configure appropriate CORS policies
6. **Token expiration**: Set reasonable token expiration times
7. **Storage cleanup**: Implement cleanup for expired codes (TODO)

## Do's and Don'ts

### Do
- ✅ Use TypeScript for type safety
- ✅ Validate all inputs with Zod
- ✅ Use logger for all logging
- ✅ Handle errors gracefully
- ✅ Follow existing file structure
- ✅ Add JSDoc comments for public APIs
- ✅ Use async/await for async operations
- ✅ Export types from `~/types.ts`

### Don't
- ❌ Use console.log (use logger instead)
- ❌ Skip input validation
- ❌ Hardcode configuration values
- ❌ Ignore TypeScript errors
- ❌ Create deeply nested directory structures
- ❌ Mix different coding styles
- ❌ Commit sensitive data or secrets
- ❌ Use any type without good reason

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm inspect          # Launch MCP inspector

# Building
pnpm build            # Build for production

# Linting
pnpm lint             # Check for linting errors
pnpm lint:fix         # Fix linting errors automatically
```

## Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [Nitro Documentation](https://nitro.build/)
- [Zod Documentation](https://zod.dev/)
- [Consola Logger](https://github.com/unjs/consola)
- [JOSE JWT Library](https://github.com/panva/jose)
