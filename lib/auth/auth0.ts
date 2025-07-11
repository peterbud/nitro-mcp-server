import type {
  AuthProviderConfig,
  OAuthServiceHandleAuthorizationRequest,
} from './index'
import { AuthProvider } from './index'

export interface Auth0Config extends AuthProviderConfig {
  domain: string
  clientId: string
  clientSecret: string
  supportDCR?: false
}

export class Auth0Provider extends AuthProvider {
  protected declare config: Auth0Config
  private baseUrl: string

  constructor(config: Auth0Config) {
    super(config)
    this.config = config
    this.baseUrl = `http://${useRuntimeConfig().mcpServer.host}:${useRuntimeConfig().mcpServer.port}`
  }

  getProtectedResource() {
    // Return the protected resource metadata for Auth0
    return {
      resource: this.baseUrl,
      authorization_servers: [
        this.config.supportDCR
          ? `https://${this.config.domain}`
          // Use our proxy as the authorization server
          : this.baseUrl,
      ],
      scopes_supported: ['all'],
      bearer_methods_supported: ['header', 'query', 'body'],
      dpop_signing_alg_values_supported: ['RS256'],
      tls_client_certificate_bound_access_tokens: false,
      resource_name: useRuntimeConfig().mcpServer.host,
      resource_documentation: `${this.config.domain}/docs`,
    }
  }

  getAuthorizationServer() {
    // Return the authorization server metadata for Auth0
    const endpoint = this.config.supportDCR
      ? `https://${this.config.domain}`
      : `${this.baseUrl}/auth`

    return {
      issuer: `${this.baseUrl}`,
      authorization_endpoint: `${endpoint}/authorize`,
      token_endpoint: `${endpoint}/token`,
      registration_endpoint: this.config.supportDCR
        ? `${endpoint}/oidc/register`
        : `${endpoint}/register`,
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code'],
      scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
      code_challenge_methods_supported: ['S256'],
      token_endpoint_auth_methods_supported: ['client_secret_post'],
    }
  }

  async getAuthorizationUrl(
    params: OAuthServiceHandleAuthorizationRequest,
    state: string,
    code_challenge: string | undefined,
  ) {
    // generate URL for Auth0 authorization endpoint
    const authUrl = new URL(`https://${this.config.domain}/authorize`)
    authUrl.searchParams.set('client_id', this.config.clientId)
    authUrl.searchParams.set('redirect_uri', `${this.baseUrl}/auth/callback`)
    authUrl.searchParams.set('response_type', params.response_type)
    authUrl.searchParams.set('scope', params.scope || 'openid profile email')
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('prompt', 'consent')

    if (code_challenge) {
      authUrl.searchParams.set('code_challenge', code_challenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')
    }
    return authUrl.toString()
  }

  async exchangeCodeForToken(code: string, code_verifier?: string) {
    const tokenUrl = `https://${this.config.domain}/oauth/token`

    logger.info('Exchanging authorization code for token')

    try {
      const response = await $fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `http://${useRuntimeConfig().mcpServer.host}:${useRuntimeConfig().mcpServer.port}/auth/callback`,
          client_id: useRuntimeConfig().mcpServer.auth.providers.auth0.clientId,
          client_secret: useRuntimeConfig().mcpServer.auth.providers.auth0.clientSecret,
          scope: useRuntimeConfig().mcpServer.auth.providers.auth0.scope,
          ...(code_verifier && { code_verifier }),
        }).toString(),
      })

      return response
    }
    catch (error) {
      logger.error('Token exchange failed', error)
      throw createError({
        statusCode: 400,
        statusMessage: `Token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }
}
