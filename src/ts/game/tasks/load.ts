import { Container, Graphics, Ticker } from 'pixi.js'

export class LoadForTask {
	public readonly viewObject: Container
	protected tickFunc?: (ticker: Ticker) => void
	protected readonly spinner: Graphics
	protected readonly core: Graphics
	protected readonly archStyleProps: {
		readonly radius: number
		readonly strokeWidth: number
	}

	public constructor() {
		this.viewObject = new Container()
		this.spinner = new Graphics()
		this.core = new Graphics()
		this.archStyleProps = {
			radius: 40,
			strokeWidth: 5,
		}
	}

	public resize(width: number, height: number): void {
		const defaultScale = 1,
			half = 2,
			maxSide = this.getMaxSide()

		this.viewObject.position.set(width / half, height / half)
		if (maxSide > height || maxSide > width) {
			const scale = Math.min(width / maxSide, height / maxSide)
			this.viewObject.scale.set(scale)
		} else {
			this.viewObject.scale.set(defaultScale)
		}
	}

	public display(): void {
		this.viewObject.addChild(this.spinner)
		this.viewObject.addChild(this.core)

		const colorCore = 0x7dd3fc,
			coreRadius = 8,
			endAngleMultiplier = 1.5,
			generalStartPosition = 0

		this.spinner.arc(
			generalStartPosition,
			generalStartPosition,
			this.archStyleProps.radius,
			generalStartPosition,
			Math.PI * endAngleMultiplier,
		)
		this.spinner.stroke({
			cap: 'round',
			color: 0x38bdf8,
			width: this.archStyleProps.strokeWidth,
		})
		this.core.circle(generalStartPosition, generalStartPosition, coreRadius)
		this.core.fill(colorCore)

		// --- Animation Loop ---

		Ticker.shared.add(this.createTickFunction())
	}

	public destroy(): void {
		this.core.destroy(true)
		this.spinner.destroy(true)
		this.viewObject.destroy(true)
		if (this.tickFunc) {
			Ticker.shared.remove(this.tickFunc)
			delete this.tickFunc
		}
	}

	protected createTickFunction(): (ticker: Ticker) => void {
		let tick = 0
		return (this.tickFunc ??= (ticker: Ticker): void => {
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
		})
	}

	// Get max side of spinner for resize calculations
	protected getMaxSide(): number {
		const half = 2
		return (
			this.archStyleProps.radius * half +
			this.archStyleProps.strokeWidth * half
		)
	}
}
