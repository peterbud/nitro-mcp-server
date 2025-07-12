import type {
  AuthProviderConfig,
  OAuthServiceHandleAuthorizationRequest,
} from './index'
import { decodeProtectedHeader, jwtVerify } from 'jose'
import { AuthProvider } from './index'

export interface EntraConfig extends AuthProviderConfig {
  tenantId: string
  clientId: string
  clientSecret: string
  supportDCR?: false
}

export class EntraProvider extends AuthProvider {
  protected declare config: EntraConfig
  private baseUrl: string

  constructor(config: EntraConfig) {
    super(config)
    this.config = config
    this.baseUrl = `http://${useRuntimeConfig().mcpServer.host}:${useRuntimeConfig().mcpServer.port}`
  }

  getProtectedResource() {
    // Return the protected resource metadata for Entra
    return {
      resource: this.baseUrl,
      authorization_servers: [
        this.config.supportDCR
          ? `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0`
          // Use our proxy as the authorization server
          : this.baseUrl,
      ],
      scopes_supported: ['all'],
      bearer_methods_supported: ['header', 'query', 'body'],
      dpop_signing_alg_values_supported: ['RS256'],
      tls_client_certificate_bound_access_tokens: false,
      resource_name: useRuntimeConfig().mcpServer.host,
      resource_documentation: `https://login.microsoftonline.com/${this.config.tenantId}/docs`,
    }
  }

  getAuthorizationServer() {
    // Return the authorization server metadata for Entra
    const endpoint = this.config.supportDCR
      ? `https://login.microsoftonline.com/${this.config.tenantId}`
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
    // generate URL for Entra authorization endpoint
    const authUrl = new URL(`https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/authorize`)
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
    const tokenUrl = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`

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
          client_id: useRuntimeConfig().mcpServer.auth.providers.entra.clientId,
          client_secret: useRuntimeConfig().mcpServer.auth.providers.entra.clientSecret,
          scope: useRuntimeConfig().mcpServer.auth.providers.entra.scope,
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

  async getUserInfoFromToken(token: string): Promise<Record<string, any>> {
    // Fetch JWKS and verify JWT
    const configUrl = `https://login.microsoftonline.com/${this.config.tenantId}/v2.0/.well-known/openid-configuration`
    const jwks = await useCachedJwks(configUrl)
    const { kid } = decodeProtectedHeader(token)
    const signingKey = jwks.keys.find((key: any) => key.kid === kid)
    if (!signingKey) {
      throw createError({
        status: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid token: Key not found',
      })
    }
    const audience = this.config.clientId
    try {
      const { payload } = await jwtVerify(token, signingKey, { audience })
      logger.info('JWT verified successfully', payload.preferred_username)
      return {
        name: payload.name,
        email: payload.preferred_username,
      }
    }
    catch (error) {
      logger.error('JWT verification failed', error)
      throw createError({
        status: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid token: Unknown error',
      })
    }
  }
}
