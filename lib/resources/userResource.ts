// filepath: /home/peterbud/dev/nitro-mcp-server/lib/resources/userResource.ts
import type { ResourceDefinition } from '~/types'
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'

export const userResource: ResourceDefinition = {
  name: 'users',
  uriOrTemplate: new ResourceTemplate(
    'https://example.com/users/{userId}',
    { list: undefined },
  ),
  config: {
    title: 'Users',
    description: 'A resource for accessing users by ID',
    mimeType: 'application/json',
  },
  readCallback: async (uri: URL, variables: { userId: string }) => {
    // Extract the userId from the variables
    const userId = variables.userId

    if (!userId) {
      throw new Error('userId is required')
    }

    try {
      const user = await $fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)

      if (!user) {
        throw new Error(`User with ID ${userId} not found`)
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(user, null, 2),
          },
        ],
      }
    }
    catch (error) {
      throw new Error(`Failed to fetch user with ID ${userId}: ${error.message}`)
    }
  },
}
