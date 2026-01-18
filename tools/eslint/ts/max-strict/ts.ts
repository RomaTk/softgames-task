import type { Config as TEslintConfig } from 'eslint/config'
import { commonTSParserOptions } from './common-ts-parser-options.js'
import eslint from '@eslint/js'
import { memberOrdering } from '../member-ordering.js'
import { tsConfigAllRules } from './ts-all-rules.js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

if (typeof commonTSParserOptions !== 'object') {
	throw new Error('commonTSParserOptions is not an object')
}

export const config: TEslintConfig = ((): TEslintConfig => {
	const keyForPlugin = '@typescript-eslint'
	return {
		languageOptions: {
			ecmaVersion: 'latest',
			globals: {},
			parser: tsParser,
			parserOptions: {
				...commonTSParserOptions,
			},
			sourceType: 'module',
		},
		plugins: {
			// POSSIBLE_BUG As here types are not correct, we need to ignore ts error. But may it will appear in some time
			//@ts-expect-error - Here really problem with types, but at runtime it works. When error will disappear, we can remove this comment
			[keyForPlugin]: tsPlugin,
		},
		rules: {
			/*
			 * Eslint all rules ( https://eslint.org/docs/latest/rules/ ) extended, by specific can change that
			 */
			...eslint.configs.all.rules,
			/*
			 * Typescript-eslint all rules ( https://typescript-eslint.io/rules/ ) extended, by specific can change that
			 */
			...tsConfigAllRules,
			[`@typescript-eslint/consistent-type-definitions`]: [
				'error',
				'type',
			],
			[`@typescript-eslint/member-ordering`]: ['error', memberOrdering],
		},
	}
})()
