import type { Config as TEslintConfig } from 'eslint/config'
import { config as maxStrictTsConfig } from './ts.js'
import reactPlugin from 'eslint-plugin-react'

export const config: TEslintConfig = ((): TEslintConfig => {
	const disabled = 0,
		enabled = 1,
		keyForPlugin = 'react'
	return {
		...maxStrictTsConfig,
		plugins: { ...maxStrictTsConfig.plugins, react: reactPlugin },
		rules: {
			...maxStrictTsConfig.rules,
			...reactPlugin.configs.all.rules,
			...reactPlugin.configs['jsx-runtime'].rules,
			[`${keyForPlugin}/jsx-filename-extension`]: [
				enabled,
				{ extensions: ['.tsx'] },
			],
			[`${keyForPlugin}/jsx-one-expression-per-line`]: [
				enabled,
				{ allow: 'single-child' },
			],
			[`${keyForPlugin}/jsx-curly-brace-presence`]: [
				enabled,
				{ children: 'always', props: 'always' },
			],
			[`${keyForPlugin}/jsx-indent`]: [disabled],
			[`${keyForPlugin}/function-component-definition`]: [disabled],
			[`@typescript-eslint/naming-convention`]: [
				'error',
				{
					format: ['camelCase'],
					selector: 'default',
				},
				{
					format: ['camelCase'],
					selector: 'variable',
				},
				{
					format: ['camelCase', 'PascalCase'],
					selector: 'variable',
					types: ['function'],
				},
				{
					format: ['camelCase', 'PascalCase'],
					selector: 'function',
				},
			],
		},
	}
})()
