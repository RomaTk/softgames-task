export const create = (
	text: string,
	emojies: {
		// It should be like (name: string) => base64 | undefined
		readonly get: (name: string) => string | undefined
	},
	throwNotCritical: (err: unknown) => void,
): string =>
	text.replace(
		/\{(?<emojie>[^}]+)\}/gu,
		(emojie): string =>
			`<img src="${((): string => {
				const helpSymbolsFromSides = 1
				return (
					emojies.get(
						emojie.substring(
							helpSymbolsFromSides,
							emojie.length - helpSymbolsFromSides,
						),
					) ??
					((): string => {
						throwNotCritical(
							Error(`Emoji with name ${emojie} not found`),
						)

						return ''
					})()
				)
			})()}" width="24" height="24" style="vertical-align: middle" />`,
	)
