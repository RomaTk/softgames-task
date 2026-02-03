export const convertUrlToBase64 = async (url: string): Promise<string> => {
	const blob = await (await fetch(url)).blob()

	// Use FileReader to read the blob
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.onloadend = (): void => {
			const { result } = reader
			if (result === null) {
				reject(new Error('Failed to convert blob to base64'))
				return
			} else if (typeof result !== 'string') {
				const textDecoder = new TextDecoder()
				resolve(textDecoder.decode(result))
				return
			}
			resolve(result)
		}
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
}
