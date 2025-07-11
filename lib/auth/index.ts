import { z } from 'zod'

export interface AuthProviderConfig {
  type: string

  /**
   * Whether the provider supports Dynamic Client Registration (DCR)
   *
   * Default is false, meaning the provider does not support DCR.
   */
  supportDCR?: boolean

  /**
   * The scope to request when accessing the protected resource.
   *
   */
  scope?: string
}

export const OAuthServiceProtectedResourceSchema = z.object({
  resource: z.string(),
  authorization_servers: z.array(z.string()),
  scopes_supported: z.array(z.string()),
  bearer_methods_supported: z.array(z.string()),
  dpop_signing_alg_values_supported: z.array(z.string()),
  tls_client_certificate_bound_access_tokens: z.boolean(),
  resource_name: z.string(),
  resource_documentation: z.string(),
})

export type OAuthServiceProtectedResource = z.infer<
  typeof OAuthServiceProtectedResourceSchema
>

export const OAuthServiceAuthorizationServerSchema = z.object({
  issuer: z.string(),
  authorization_endpoint: z.string(),
  token_endpoint: z.string(),
  registration_endpoint: z.string(),
  response_types_supported: z.array(z.string()),
  grant_types_supported: z.array(z.string()),
  scopes_supported: z.array(z.string()),
  code_challenge_methods_supported: z.array(z.string()),
  token_endpoint_auth_methods_supported: z.array(z.string()),
})

export type OAuthServiceAuthorizationServer = z.infer<
  typeof OAuthServiceAuthorizationServerSchema
>

export const OAuthServiceRegisterClientRequestSchema = z.object({
  client_id: z.string().optional(),
  client_secret: z.string().optional(),
  redirect_uris: z.array(z.string()),
  response_types: z.array(z.string()).optional(),
  grant_types: z.array(z.string()).optional(),
  application_type: z.enum(['web', 'native']).optional(),
  client_name: z.string().optional(),
  client_uri: z.string().optional(),
  scope: z.string().optional(),
  contacts: z.array(z.string()).optional(),
  tos_uri: z.string().optional(),
  policy_uri: z.string().optional(),
  jwks_uri: z.string().optional(),
  token_endpoint_auth_method: z.string().optional(),
})

export type OAuthServiceRegisterClientRequest = z.infer<
  typeof OAuthServiceRegisterClientRequestSchema
>

export const OAuthServiceRegisterClientResponseSchema = z.object({
  client_id: z.string(),
  client_secret: z.string().optional(),
  redirect_uris: z.array(z.string()),
  response_types: z.array(z.string()),
  grant_types: z.array(z.string()),
  application_type: z.string(),
  client_name: z.string().optional(),
  client_uri: z.string().optional(),
  scope: z.string().optional(),
  contacts: z.array(z.string()).optional(),
  tos_uri: z.string().optional(),
  policy_uri: z.string().optional(),
  jwks_uri: z.string().optional(),
  token_endpoint_auth_method: z.string(),
  client_id_issued_at: z.number(),
  client_secret_expires_at: z.number().optional(),
})

export type OAuthServiceRegisterClientResponse = z.infer<
  typeof OAuthServiceRegisterClientResponseSchema
>

export const OAuthServiceHandleAuthorizationRequestSchema = z.object({
  client_id: z.string(),
  redirect_uri: z.string(),
  response_type: z.string(),
  scope: z.string().optional(),
  state: z.string().optional(),
  code_challenge: z.string().optional(),
  code_challenge_method: z.enum(['plain', 'S256']).optional(),
})

export type OAuthServiceHandleAuthorizationRequest = z.infer<
  typeof OAuthServiceHandleAuthorizationRequestSchema
>

export const OAuthServiceHandleTokenRequestSchema = z.object({
  grant_type: z.string(),
  code: z.string().optional(),
  redirect_uri: z.string().optional(),
  client_id: z.string(),
  client_secret: z.string().optional(),
  code_verifier: z.string().optional(),
  refresh_token: z.string().optional(),
})

export type OAuthServiceHandleTokenRequest = z.infer<
  typeof OAuthServiceHandleTokenRequestSchema
>

export interface AuthCodeData {
  state: string
  client_id: string
  code_verifier?: string
  original_redirect_uri: string
  original_state?: string
  original_client_code_challenge?: string
  original_client_code_challenge_method?: string
  created_at: number
  expires_at: number
}

export abstract class AuthProvider {
  protected config: AuthProviderConfig

  constructor(config: AuthProviderConfig) {
    this.config = config
  }

  // Provider metadata
  abstract getProtectedResource(): OAuthServiceProtectedResource
  abstract getAuthorizationServer(): OAuthServiceAuthorizationServer
  abstract getAuthorizationUrl(
    params: OAuthServiceHandleAuthorizationRequest,
    state: string,
    code_challenge: string | undefined,
  ): Promise<string>
  abstract exchangeCodeForToken(
    code: string,
    code_verifier?: string
  ): Promise<Record<string, any>>
}
