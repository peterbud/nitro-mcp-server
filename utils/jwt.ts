export const useCachedJwks = defineCachedFunction(async (configUrl: string) => {
  // Fetch the OpenID configuration
  const data = await $fetch<any>(configUrl)

  // Extract the JWKS URI from the OpenID configuration
  const jwksUri = data.jwks_uri

  // Fetch the JWKS (JSON Web Key Set)
  const jwks = await $fetch<any>(jwksUri)

  return jwks
}, {
  maxAge: 60 * 60, // 60 minutes
  name: 'jwksCache',
  getKey: (tenant: string) => tenant,
})
