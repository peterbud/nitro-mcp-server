import type { AuthProvider, AuthProviderConfig } from './'
import type { Auth0Config } from './auth0'
import type { EntraConfig } from './entra'
import { Auth0Provider } from './auth0'
import { EntraProvider } from './entra'
// import type { GoogleConfig } from './google'

export class ProviderFactory {
  static createProvider(config: AuthProviderConfig): AuthProvider {
    switch (config.type) {
      case 'auth0':
        return new Auth0Provider(config as Auth0Config)
      case 'entra':
        return new EntraProvider(config as EntraConfig)
      // case 'google':
      //   return new GoogleProvider(config as GoogleConfig)
      default:
        throw new Error(`Unsupported auth provider type: ${config.type}`)
    }
  }
}
