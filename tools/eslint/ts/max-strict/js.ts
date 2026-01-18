import type { Config as TEslintConfig } from 'eslint/config'
import eslint from '@eslint/js'

export const config: TEslintConfig = {
	languageOptions: {
		ecmaVersion: 'latest',
		globals: {},
		sourceType: 'module',
	},
	rules: {
		/*
		 * Eslint all rules ( https://eslint.org/docs/latest/rules/ ) extended, by specific can change that
		 */
		...eslint.configs.all.rules,
	},
}
