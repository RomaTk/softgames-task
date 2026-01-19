import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(() => {
	return {
		plugins: [
			react(),
			tsconfigPaths({
				projects: ['./src/tsconfig.json'],
			}),
		],
		root: './src/',
		build: {
			outDir: 'dist',
		},
	}
})
