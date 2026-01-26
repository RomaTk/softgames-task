export type TStaticLoadForTask<
	CoreLike,
	SpinnerLike,
	ViewObjectLike,
	TickerCallbackLike,
> = {
	readonly createViewObject: () => ViewObjectLike
	readonly createCore: () => CoreLike
	readonly createSpinner: () => SpinnerLike
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

export class LoadForTask<
	CoreLike extends TChildViewObject,
	SpinnerLike extends TChildViewObject,
	ViewObjectLike extends TViewObject<CoreLike, SpinnerLike>,
	TickerCallbackLike,
	TickerLike extends TTicker<TickerCallbackLike>,
	StaticFunctionsLike extends TStaticLoadForTask<
		CoreLike,
		SpinnerLike,
		ViewObjectLike,
		TickerCallbackLike
	>,
> {
	public readonly viewObject: ViewObjectLike
	protected isDestroyed: boolean
	protected readonly tickerCallback: TickerCallbackLike
	protected readonly spinner: SpinnerLike
	protected readonly core: CoreLike
	protected readonly staticFunctions: StaticFunctionsLike
	protected readonly maxSide: number
	protected readonly ticker: TickerLike

	public constructor(
		staticFunctions: StaticFunctionsLike,
		resize: { readonly width: number; readonly height: number },
		ticker: TickerLike,
	) {
		this.ticker = ticker
		this.staticFunctions = staticFunctions
		const objects = this.generateViewObjects()
		this.viewObject = objects.viewObject
		this.spinner = objects.spinner
		this.core = objects.core

		this.maxSide = Math.max(this.viewObject.width, this.viewObject.height)

		this.tickerCallback = this.staticFunctions.createTickFunction(
			this.spinner,
			this.core,
		)
		this.isDestroyed = false
		this.init(resize)
	}

	public resize(width: number, height: number): void {
		const defaultScale = 1,
			half = 2

		this.viewObject.position.set(width / half, height / half)
		if (this.maxSide > height || this.maxSide > width) {
			const scale = Math.min(width / this.maxSide, height / this.maxSide)
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

	protected generateViewObjects(): {
		viewObject: ViewObjectLike
		spinner: SpinnerLike
		core: CoreLike
	} {
		const objects = {
			core: this.staticFunctions.createCore(),
			spinner: this.staticFunctions.createSpinner(),
			viewObject: this.staticFunctions.createViewObject(),
		}

		objects.viewObject.addChild(objects.spinner)
		objects.viewObject.addChild(objects.core)

		return objects
	}

	protected init(resize: {
		readonly width: number
		readonly height: number
	}): void {
		this.resize(resize.width, resize.height)
		this.ticker.add(this.tickerCallback)
	}
}
