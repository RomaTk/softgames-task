import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// TODO May adjust bundler
export default defineConfig(() => ({
	build: {
		emptyOutDir: true,
		outDir: '../../dist',
	},
	plugins: [
		react(),
		tsconfigPaths({
			projects: ['./tsconfig.json'],
		}),
	],
	root: './src/ts',
	server: {
		host: true,
		port: 9000,
		strictPort: true,
	},
}))
