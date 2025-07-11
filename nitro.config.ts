export default defineNitroConfig({
  compatibilityDate: '2025-03-01',
  runtimeConfig: {
    mcpServer: {
      host: process.env.NITRO_MCP_SERVER_HOST || 'localhost',
      port: process.env.NITRO_MCP_SERVER_PORT || '3000',
      endpoint: '/mcp',
      auth: {
        enabled: process.env.NITRO_MCP_SERVER_AUTH_ENABLED === 'true',
        defaultProvider: process.env.NITRO_MCP_SERVER_AUTH_DEFAULT_PROVIDER || 'auth0',
        providers: {
          auth0: {
            type: 'auth0',
            clientId: process.env.NITRO_MCP_SERVER_AUTH_PROVIDERS_AUTH0_CLIENT_ID || '',
            clientSecret: process.env.NITRO_MCP_SERVER_AUTH_PROVIDERS_AUTH0_CLIENT_SECRET || '',
            domain: process.env.NITRO_MCP_SERVER_AUTH_PROVIDERS_AUTH0_DOMAIN || '',
            scope: process.env.NITRO_MCP_SERVER_AUTH_PROVIDERS_AUTH0_SCOPE || 'openid profile email',
          },
          entra: {
            type: 'entra',
            tenantId: process.env.NITRO_MCP_SERVER_AUTH_PROVIDERS_ENTRA_TENANT_ID || '',
            clientId: process.env.NITRO_MCP_SERVER_AUTH_PROVIDERS_ENTRA_CLIENT_ID || '',
            clientSecret: process.env.NITRO_MCP_SERVER_AUTH_PROVIDERS_ENTRA_CLIENT_SECRET || '',
            scope: process.env.NITRO_MCP_SERVER_AUTH_PROVIDERS_ENTRA_SCOPE || 'openid profile email',
          },
        },
      },
    },
  },
  experimental: {
    asyncContext: true,
  },
  routeRules: {
    '/**': {
      cors: true,
    },
  },
  storage: {
    registrationStore: {
      driver: 'fs',
      base: './.data/reg',
    },
    authCodeStore: {
      driver: 'fs',
      base: './.data/codes',
    },
  },
})
