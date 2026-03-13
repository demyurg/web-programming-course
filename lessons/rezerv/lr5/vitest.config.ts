import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        'generated/',
        'mock-server/',
        'orval.config.ts',
        'postcss.config.js',
        'tailwind.config.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'src/main.tsx',
        'src/App.tsx',
        'src/api/**',
        'src/components/Auth/**',
        'src/tasks/Task4.tsx',
        'src/types/**',
      ],
    },
  },
});

