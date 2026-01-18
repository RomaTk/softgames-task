import type * as prettier from 'prettier'

const options: prettier.Options = {
	arrowParens: 'always',
	bracketSameLine: false,
	bracketSpacing: true,
	embeddedLanguageFormatting: 'auto',
	endOfLine: 'lf',
	htmlWhitespaceSensitivity: 'strict',
	// But for this project, jsx is not used
	jsxSingleQuote: true,
	printWidth: 80,
	proseWrap: 'always',
	quoteProps: 'as-needed',
	semi: false,
	singleAttributePerLine: true,
	singleQuote: true,
	tabWidth: 4,
	// So last object property will have a comma, no change all time it's better
	trailingComma: 'all',
	useTabs: true,
	// But for this project, vue is not used
	vueIndentScriptAndStyle: true,
}

export default options
