import { calcSkew } from './calc-skew.js'
import { getMidSkew } from './mid-skew.js'
import { getPeak } from './peak.js'

// eslint-disable-next-line max-lines-per-function
export const skewRecalculation = (args: {
	readonly progress: number
	readonly cardsInfo: {
		// From top
		readonly currentIndex: number
		// Number of cards (whole deck)
		readonly totalCount: number
	}
	readonly startSkew: { readonly x: number; readonly y: number }
	readonly finalSkew: { readonly x: number; readonly y: number }
}): { skewX: number; skewY: number } => {
	const { progress, finalSkew, startSkew } = args,
		def = 1,
		progressTimeSeparator = 0.5
	return calcSkew({
		finalSkew,
		getArc: (timeProgress: number) => {
			// First half: positive overshoot
			if (progress < progressTimeSeparator) {
				// Specific numbers for visual effect
				// eslint-disable-next-line @typescript-eslint/no-magic-numbers
				return -4 * (timeProgress - 0.5) ** 2 + 1
			}
			// Second half: much smaller, gentler negative overshoot

			// Specific numbers for visual effect
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			return 0.2 * (1 - (timeProgress - 0.5) ** 2 * 4)
		},
		// Use a much flatter, less pronounced arc
		midSkew: getMidSkew(
			// Peaks depend on card index: lower index = bigger first peak, smaller second
			getPeak(
				def -
					args.cardsInfo.currentIndex /
						Math.max(def, args.cardsInfo.totalCount - def),
				((): { max: number; min: number } => {
					// First half: positive overshoot
					if (progress < progressTimeSeparator) {
						return {
							max: 2.5,
							min: 0.5,
						}
					}
					// Second half: much smaller, gentler negative overshoot
					return {
						max: 0.01,
						min: 0.3,
					}
				})(),
			),
			{
				final: finalSkew,
				start: startSkew,
			},
		),
		startSkew,
		timeProgress: ((): number => {
			const timeForSkewDivider = 0.5
			if (progress < progressTimeSeparator) {
				return progress / timeForSkewDivider
			}
			return (progress - progressTimeSeparator) / timeForSkewDivider
		})(),
	})
}
