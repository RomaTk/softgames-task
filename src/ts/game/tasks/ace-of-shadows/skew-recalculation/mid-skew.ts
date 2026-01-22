export const getMidSkew = (
	peak: number,
	skew: {
		readonly start: { readonly x: number; readonly y: number }
		readonly final: { readonly x: number; readonly y: number }
	},
): { byX: number; byY: number } => {
	const def = 1
	return {
		byX: skew.start.x + (skew.final.x - skew.start.x) * (def + peak),
		byY: skew.start.y + (skew.final.y - skew.start.y) * (def + peak),
	}
}
