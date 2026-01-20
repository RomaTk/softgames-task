import { extname } from 'path'
import { replaceInFileSync } from 'replace-in-file'

const options = {
	dry: false,
	files: 'node_modules/@pixi/layout/**/*.{js,mjs,d.ts}',
	// Regex capture groups:
	// 1. Prefix: (import/from + quote)
	// 2. Path:   (./something)
	// 3. Suffix: (quote)
	from: /(?<prefix>(?:from|import)(?:\s+|\s*\(\s*)['"])(?<path>\.[^'"]+)(?<suffix>['"])/gu,

	to: (match: string): string => {
		// We look for the path inside the quotes
		const parts =
			/(?<prefix>(?:from|import)(?:\s+|\s*\(\s*)['"])(?<path>\.[^'"]+)(?<suffix>['"])/u.exec(
				match,
			)

		if (!parts) {
			return match
		}

		return ((): string => {
			const [, prefix, importPath, suffix] = parts

			if (
				typeof importPath !== 'string' ||
				typeof prefix !== 'string' ||
				typeof suffix !== 'string'
			) {
				throw new Error('Unexpected parsing error in replace callback.')
			}

			// Ignore directory imports or empty paths
			if (
				importPath === '.' ||
				importPath === '..' ||
				importPath.endsWith('/')
			) {
				return match
			}

			// Extension Check: If it has an extension (like .css, .png, .js), leave it alone
			if (extname(importPath)) {
				return match
			}

			// Add .js
			return `${prefix}${importPath}.js${suffix}`
		})()
	},
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
