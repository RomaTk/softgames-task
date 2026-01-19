import { replaceInFileSync } from 'replace-in-file'

// Configuration
const options = {
	dry: false,
	files: 'node_modules/@pixi/layout/**/*.{js,mjs,d.ts}',
	from: /(?<temp3>(?:from|import)(?:\s+|\s*\(\s*)['"])(?<temp2>\.[^'"]+?)(?<!\.js)(?<!\.json)(?<temp1>['"])/gu,
	to: '$1$2.js$3',
}

try {
	const changedFiles = replaceInFileSync(options)
		.filter(
			(rpResult: { readonly hasChanged: boolean }) => rpResult.hasChanged,
		)
		.map((rpResult: { readonly file: string }) => rpResult.file)

	if (changedFiles.length) {
		console.log(
			`✅ Added .js extensions to ${changedFiles.length} files in @pixi/layout`,
		)
	} else {
		console.log('No files needed fixing.')
	}
} catch (error) {
	console.error('Error occurred:', error)
}
