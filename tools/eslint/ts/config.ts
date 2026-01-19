import type { Config as TEslintConfig } from 'eslint/config'
import { config as commonJsConfig } from './max-strict/js.js'
import globals from 'globals'
import { config as maxStrictTsConfig } from './max-strict/ts.js'
import { config as maxStrictTsReactConfig } from './max-strict/ts-react.js'

const config: TEslintConfig[] = [
	{
		files: ['tools/eslint/ts/**/*.ts'],
		...maxStrictTsConfig,
		languageOptions: {
			...maxStrictTsConfig.languageOptions,
			parserOptions: {
				...(maxStrictTsConfig.languageOptions?.['parserOptions'] ?? {}),
				project: ['./tools/eslint/ts/tsconfig.json'],
			},
		},
	},
	{
		files: ['tools/prettier/ts/**/*.ts'],
		...maxStrictTsConfig,
		languageOptions: {
			...maxStrictTsConfig.languageOptions,
			parserOptions: {
				...(maxStrictTsConfig.languageOptions?.['parserOptions'] ?? {}),
				project: ['./tools/prettier/ts/tsconfig.json'],
			},
		},
	},
	{
		files: ['tools/vite/ts/**/*.ts'],
		...maxStrictTsConfig,
		languageOptions: {
			...maxStrictTsConfig.languageOptions,
			parserOptions: {
				...(maxStrictTsConfig.languageOptions?.['parserOptions'] ?? {}),
				project: ['./tools/vite/ts/tsconfig.json'],
			},
		},
	},
	{
		files: ['tools/fix-esm-import/ts/**/*.ts'],
		...maxStrictTsConfig,
		languageOptions: {
			...maxStrictTsConfig.languageOptions,
			globals: {
				...(maxStrictTsReactConfig.languageOptions?.['globals'] ?? {}),
				// Here is globals for node (not all for node - to control better what is added)
				console: globals.node.console,
			},
			parserOptions: {
				...(maxStrictTsConfig.languageOptions?.['parserOptions'] ?? {}),
				project: ['./tools/fix-esm-import/ts/tsconfig.json'],
			},
		},
		rules: {
			...maxStrictTsConfig.rules,
			[`no-console`]: 'off',
		},
	},
	{
		files: ['src/ts/**/*.ts'],
		...maxStrictTsConfig,
		languageOptions: {
			...maxStrictTsConfig.languageOptions,
			globals: {
				...(maxStrictTsConfig.languageOptions?.['globals'] ?? {}),
				// Here is globals for browser (not all for browser - to control better what is added)
				document: globals.browser.document,
				window: globals.browser.window,
			},
			parserOptions: {
				...(maxStrictTsConfig.languageOptions?.['parserOptions'] ?? {}),
				project: ['./src/ts/tsconfig.json'],
			},
		},
	},
	// TSX files (all react related files better to keep only in .tsx files)
	{
		files: ['src/ts/**/*.tsx'],
		...maxStrictTsReactConfig,
		languageOptions: {
			...maxStrictTsReactConfig.languageOptions,
			globals: {
				...(maxStrictTsReactConfig.languageOptions?.['globals'] ?? {}),
				// Here is globals for browser (not all for browser - to control better what is added)
				document: globals.browser.document,
			},
			parserOptions: {
				...(maxStrictTsReactConfig.languageOptions?.['parserOptions'] ??
					{}),
				project: ['./src/ts/tsconfig.json'],
			},
		},
	},
	{
		files: ['*.js'],
		...commonJsConfig,
	},
]

export default config
