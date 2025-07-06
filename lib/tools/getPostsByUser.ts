import type { Tool } from '~/types'
import { z } from 'zod'

const inputSchema = {
  userId: z.number(),
}

const outputSchema = {
  posts: z.array(z.object({
    userId: z.number(),
    id: z.number(),
    title: z.string(),
    body: z.string(),
  })),
}

export const getPostsByUserTool: Tool<typeof inputSchema, typeof outputSchema> = {
  name: 'getPostsByUser',
  options: {
    title: 'Get posts by User',
    description: 'Get posts for a user',
    inputSchema,
    outputSchema,
  },
  handler: async ({ userId }) => {
    const posts = await $fetch<typeof outputSchema>(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
    if (Array.isArray(posts) && posts.length > 0) {
      return {
        // content: [{ type: 'text', text: JSON.stringify(posts, null, 2) }],
        structuredContent: { posts },
      }
    }
    else {
      return {
        // content: [],
        structuredContent: { posts: [] },
      }
    }
  },
}
