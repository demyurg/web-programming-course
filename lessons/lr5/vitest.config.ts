import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom', // вирт браузер
		setupFiles: './src/tasks/setupTest.ts',
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			include: ['src/tasks/**/*.{ts,tsx}'],
			exclude: ['**/*.test.{ts,tsx}', '**/*.d.ts', 'src/tasks/Task4.tsx'],
		},
	},
})
// конфигурация теста
