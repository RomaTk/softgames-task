import type { Config as TEslintConfig } from 'eslint/config'
import { config as maxStrictTsConfig } from './ts.js'
import reactPlugin from 'eslint-plugin-react'

export type TRules = Exclude<TEslintConfig['rules'], undefined>

export const config: TEslintConfig = ((): TEslintConfig => {
	const disabled = 0,
		enabled = 1,
		keyForPlugin = 'react',
		maxConventionRule = {
			...((): TRules => {
				const current =
						maxStrictTsConfig.rules?.[
							`@typescript-eslint/naming-convention`
						],
					excludeRule = {
						filter: {
							match: true,
							regex: '^Component',
						},
						format: ['PascalCase'],
						selector: ['variable', 'function'],
					}
				if (Array.isArray(current)) {
					return {
						[`@typescript-eslint/naming-convention`]: [
							...current,
							excludeRule,
						],
					}
				} else if (typeof current === 'string') {
					return {
						[`@typescript-eslint/naming-convention`]: [
							current,
							excludeRule,
							{
								format: ['PascalCase'],
								selector: 'typeLike',
							},
							{
								format: ['camelCase'],
								leadingUnderscore: 'forbid',
								selector: ['variable', 'function', 'parameter'],
							},
						],
					}
				}
				return {}
			})(),
		}
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
			...maxConventionRule,
		},
		settings: {
			...(maxStrictTsConfig.settings ?? {}),
			react: {
				...(maxStrictTsConfig.settings?.['react'] ?? {}),
				version: 'detect',
			},
		},
	}
})()
