export const calcSkew = (options: {
	readonly startSkew: { readonly x: number; readonly y: number }
	readonly midSkew: { readonly byX: number; readonly byY: number }
	readonly finalSkew: { readonly x: number; readonly y: number }
	readonly timeProgress: number
	readonly getArc: (timeProgress: number) => number
}): { skewX: number; skewY: number } => {
	const arc = options.getArc(options.timeProgress),
		def = 1,
		twice = 2
	return ((
		multipliedArc: number,
		leftTime: number,
	): { skewX: number; skewY: number } => ({
		skewX:
			options.startSkew.x * leftTime +
			options.midSkew.byX * multipliedArc +
			options.finalSkew.x * options.timeProgress,
		skewY:
			options.startSkew.y * leftTime +
			options.midSkew.byY * multipliedArc +
			options.finalSkew.y * options.timeProgress,
	}))(
		arc * (def - Math.abs(twice * options.timeProgress - def)),
		def - options.timeProgress,
	)
}
