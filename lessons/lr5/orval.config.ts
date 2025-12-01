import { defineConfig } from 'orval';

export default defineConfig({
  quiz: {
    input: {
      target: './quiz-api-schema.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './generated/api',
      schemas: './generated/api/quizBattleAPI.schemas.ts',   // 📌 ДОБАВЛЕНО
      client: 'react-query',
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
            }
          },
        },
      },
      prettier: true,
      clean: true,
    },
    hooks: {
      afterAllFilesWrite: 'prettier --write',
    },
  },
});
