import type { Config as TEslintConfig } from 'eslint/config'
import { config as commonJsConfig } from './max-strict/js.js'
import { config as maxStrictTsConfig } from './max-strict/ts.js'

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
		files: ['*.js'],
		...commonJsConfig,
	},
]

export default config
