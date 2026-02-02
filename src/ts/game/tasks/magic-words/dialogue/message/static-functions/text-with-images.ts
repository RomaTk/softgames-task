export const create = (
	text: string,
	emojies: ReadonlyMap<string, string>,
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
						try {
							throw Error(`Emoji with name ${emojie} not found`)
						} catch (err) {
							throwNotCritical(err)
						}

						return ''
					})()
				)
			})()}" width="24" height="24" style="vertical-align: middle" />`,
	)
