export type TCore = {
	alpha: number
	readonly scale: { readonly set: (value: number) => void }
}
export type TSpinner = { rotation: number }

export class TickerCallBack<Spinner extends TSpinner, Core extends TCore> {
	protected readonly spinner: Spinner
	protected readonly core: Core

	public constructor(spinner: Spinner, core: Core) {
		this.spinner = spinner
		this.core = core
	}

	public get tickCallback() {
		let tick = 0

		return (ticker: { readonly deltaTime: number }): void => {
			const { deltaTime } = ticker,
				radMultiplier = 2,
				rotationMultiplier = 0.15,
				tickMultiplier = 0.1

			tick =
				(tick + tickMultiplier * deltaTime) % (Math.PI * radMultiplier)

			// Rotate Spinner
			this.spinner.rotation += rotationMultiplier * deltaTime
			;((): void => {
				const animNumbers = {
					alpha: {
						default: 0.8,
						multiplier: 0.2,
					},
					scale: {
						default: 1,
						multiplier: 0.2,
					},
				}
				this.core.scale.set(
					animNumbers.scale.default +
						Math.sin(tick) * animNumbers.scale.multiplier,
				)
				this.core.alpha =
					animNumbers.alpha.default +
					Math.sin(tick) * animNumbers.alpha.multiplier
			})()
		}
	}
}
