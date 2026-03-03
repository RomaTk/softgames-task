export const genRandomSkew = (): {
	readonly x: number
	readonly y: number
} => {
	const factor = 0.05
	return { [`x`]: Math.random() * factor, [`y`]: Math.random() * factor }
}
