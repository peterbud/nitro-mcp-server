import type { PromptDefinition } from '~/types'
import { z } from 'zod'

const argsSchema = {
  userId: z.string().min(1).max(100).describe('The ID of the user whose posts you want to save'),
  fileName: z.string().optional().describe('Optional file name to save the posts, defaults to "user-posts.md"'),
}

export const savePostsOfUserPrompt: PromptDefinition<typeof argsSchema> = {
  name: 'savePostsOfUser',
  options: {
    title: 'Save Posts of User',
    description: 'Save all posts of a specific user as a markdown file',
    argsSchema,
  },
  cb: async (args) => {
    const { userId, fileName } = args
    if (!userId) {
      throw new Error('User ID is required to save posts.')
    }
    if (fileName && typeof fileName !== 'string') {
      throw new Error('File name must be a string.')
    }
    // check if fileName is provided, otherwise use default
    const finalFileName = fileName || 'user-posts.md'

    // Implementation for saving posts of the user
    return {
      description: `Retrieve and save posts of user ${userId} to ${finalFileName}.`,
      messages: [
        {
          role: 'assistant',
          content:
            {
              type: 'text',
              text: `Retrieve posts of user ${userId} using \`getPostsByUser\` tool.`,
            },
        },
        {
          role: 'assistant',
          content:
            {
              type: 'text',
              text: `Save posts of user ${userId} to ${finalFileName}.`,
            },
        },
      ],
    }
  },
}
