import type { ResourceDefinition } from '~/types'
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'

export const postResource: ResourceDefinition = {
  name: 'posts',
  uriOrTemplate: new ResourceTemplate(
    'https://example.com/posts/{postId}',
    { list: undefined },
  ),
  config: {
    title: 'Posts',
    description: 'A resource for accessing posts by ID',
    mimeType: 'application/json',
  },
  readCallback: async (uri: URL, variables: { postId: string }) => {
    // Extract the postId from the variables
    const postId = variables.postId

    if (!postId) {
      throw new Error('postId is required')
    }

    try {
      const post = await $fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)

      if (!post) {
        throw new Error(`Post with ID ${postId} not found`)
      }

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(post, null, 2),
          },
        ],
      }
    }
    catch (error) {
      throw new Error(`Failed to fetch post with ID ${postId}: ${error.message}`)
    }
  },
}
