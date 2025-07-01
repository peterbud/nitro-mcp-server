export default defineNitroConfig({
  compatibilityDate: '2025-03-01',
  runtimeConfig: {
    mcpServer: {
      host: 'localhost',
      port: 3000,
      endpoint: '/mcp',
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
})
