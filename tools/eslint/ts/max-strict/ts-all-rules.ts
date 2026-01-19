import type { Config as TEslintConfig } from 'eslint/config'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export const tsConfigAllRules: Partial<TEslintConfig['rules']> = ((): Partial<
	TEslintConfig['rules']
> => {
	const { configs } = tsPlugin
	if ('all' in configs) {
		const all: unknown = tsPlugin.configs['all']
		if (typeof all === 'object' && all !== null && 'rules' in all) {
			//@ts-expect-error - We can not guarantee types here, but we will get error in eslint is some problem
			const rules: Partial<TEslintConfig['rules']> = all.rules
			return rules
		}
	}
	throw new Error(
		'Could not extract all rules from typescript-eslint plugin configs',
	)
})()
