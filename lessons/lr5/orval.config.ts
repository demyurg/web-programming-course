import { defineConfig } from 'orval'

export default defineConfig({
  quiz: {
    input: {
      target: './quiz-api-schema.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './generated/api',
      client: 'react-query',
      baseUrl: 'http://localhost:3000',
      override: {
        mutator: {
          path: './src/api/client.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
        },
        operations: {
          getApiAuthGithubCallback: {
            query: {
              useQuery: true,
              useMutation: true,
            },
            // : true,
          },
        },
      },
      prettier: true,
      clean: true,
    },
  },
})
