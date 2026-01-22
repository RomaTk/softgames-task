export const getPeak = (
	idxNorm: number,
	limits: {
		readonly max: number
		readonly min: number
	},
): number => limits.min + (limits.max - limits.min) * idxNorm
