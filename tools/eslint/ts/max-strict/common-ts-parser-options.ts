import * as path from 'path'
import type { Config as TEslintConfig } from 'eslint/config'

export const commonTSParserOptions: Exclude<
	TEslintConfig['languageOptions'],
	undefined
>['parserOptions'] = {
	allowAutomaticSingleRunInference: true,
	ecmaFeatures: 'latest',
	ecmaVersion: 'latest',
	globalReturn: false,
	jsDocParsingMode: 'all',
	projectFolderIgnoreList: ['**/node_modules/**'],
	tsconfigRootDir: path.resolve('./'),
	warnOnUnsupportedTypeScriptVersion: true,
}
