export type TStaticLoadView<
	CoreLike,
	SpinnerLike,
	ViewObjectLike,
	TickerCallbackLike,
> = {
	readonly createViewObjects: () => {
		readonly core: CoreLike
		readonly spinner: SpinnerLike
		readonly viewObject: ViewObjectLike
	}
	readonly createTickFunction: (
		spinner: SpinnerLike,
		core: CoreLike,
	) => TickerCallbackLike
}

export type TViewObject<Core, Spinner> = {
	readonly addChild: (child: Core | Spinner) => void
	readonly width: number
	readonly height: number
	readonly destroy: (deep: true) => void
	readonly position: {
		set: (x: number, y: number) => void
	}
	readonly scale: {
		set: (value: number) => void
	}
}

export type TChildViewObject = {
	readonly destroy: (deep: true) => void
}

export type TTicker<TickerCallbackLike> = {
	readonly add: (callback: TickerCallbackLike) => void
	readonly remove: (callback: TickerCallbackLike) => void
}

export type TSize = {
	readonly width: number
	readonly height: number
}

export class LoadView<
	CoreLike extends TChildViewObject,
	SpinnerLike extends TChildViewObject,
	ViewObjectLike extends TViewObject<CoreLike, SpinnerLike>,
	TickerCallbackLike,
	TickerLike extends TTicker<TickerCallbackLike>,
	SizeLike extends TSize,
> {
	public readonly viewObject: ViewObjectLike
	protected isDestroyed: boolean
	protected readonly tickerCallback: TickerCallbackLike
	protected readonly spinner: SpinnerLike
	protected readonly core: CoreLike
	protected readonly maxSide: number
	protected readonly ticker: TickerLike
	protected readonly size: SizeLike

	public constructor(
		staticFunctions: TStaticLoadView<
			CoreLike,
			SpinnerLike,
			ViewObjectLike,
			TickerCallbackLike
		>,
		size: SizeLike,
		ticker: TickerLike,
	) {
		this.ticker = ticker
		const objects = staticFunctions.createViewObjects()
		this.viewObject = objects.viewObject
		this.spinner = objects.spinner
		this.core = objects.core

		this.maxSide = Math.max(this.viewObject.width, this.viewObject.height)

		this.tickerCallback = staticFunctions.createTickFunction(
			this.spinner,
			this.core,
		)
		this.isDestroyed = false
		this.size = size
		this.init()
	}

	public resize(): void {
		if (this.isDestroyed) {
			throw new Error('Cannot resize destroyed LoadView')
		}
		const defaultScale = 1,
			half = 2

		this.viewObject.position.set(
			this.size.width / half,
			this.size.height / half,
		)
		if (this.maxSide > this.size.height || this.maxSide > this.size.width) {
			const scale = Math.min(
				this.size.width / this.maxSide,
				this.size.height / this.maxSide,
			)
			this.viewObject.scale.set(scale)
		} else {
			this.viewObject.scale.set(defaultScale)
		}
	}

	public destroy(): void {
		if (this.isDestroyed) {
			return
		}
		this.isDestroyed = true
		this.core.destroy(true)
		this.spinner.destroy(true)
		this.viewObject.destroy(true)
		this.ticker.remove(this.tickerCallback)
	}

	protected init(): void {
		this.resize()
		this.ticker.add(this.tickerCallback)
	}
}
