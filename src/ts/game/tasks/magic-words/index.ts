import { Container, Ticker, type TickerCallback } from 'pixi.js'
import { Dialogue } from './dialogue/index.js'
import { LoadView } from './load/index.js'
import { Loader } from './loader.js'
import { staticFunctions } from './load/static-fuctions.js'

export type TSize = {
	readonly width: number
	readonly height: number
}

export class MagicWordsTask<SizeLike extends TSize> {
	public readonly viewObject: Container
	public readonly afterInitPromise: Promise<void>
	protected readonly loader: Loader
	protected readonly scenes: {
		dialogue?: Dialogue<SizeLike, Loader['data']>
		load?: LoadView<
			ReturnType<(typeof staticFunctions)['createCore']>,
			ReturnType<(typeof staticFunctions)['createSpinner']>,
			ReturnType<(typeof staticFunctions)['createViewObject']>,
			TickerCallback<Ticker>,
			Ticker,
			SizeLike
		>
	}
	// We save this data because objects are created dynamically and need the value set immediately
	protected readonly size: SizeLike

	public constructor(size: SizeLike) {
		this.size = size
		this.loader = new Loader(
			'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords',
		)
		this.viewObject = new Container()
		this.scenes = {}
		this.afterInitPromise = this.init()
	}

	public get afterInit(): Promise<void> {
		return this.afterInitPromise
	}

	protected get data(): Loader['data'] {
		return this.loader.data
	}

	public resize(): void {
		this.scenes.load?.resize()
		this.scenes.dialogue?.resize()
	}

	public async destroy(): Promise<void> {
		this.destroyLoadForTask()
		this.destroyDialogue()
		this.viewObject.destroy(true)
		await this.loader.destroy()
	}

	protected async init(): Promise<void> {
		const load = new LoadView(staticFunctions, this.size, Ticker.shared)
		this.viewObject.addChild(load.viewObject)
		this.scenes.load = load
		try {
			await this.loader.afterLoad
			this.initAfterLoad()
		} catch (err: unknown) {
			if (err === this.loader.destroyDuringLoadingError) {
				// Expected behavior, do nothing
				return
			}
			throw err
		}
	}

	protected initAfterLoad(): void {
		this.scenes.dialogue = new Dialogue(this.size, this.data)
		this.viewObject.addChild(this.scenes.dialogue.viewObject)
		this.destroyLoadForTask()
	}

	protected destroyLoadForTask(): void {
		this.scenes.load?.destroy()
		delete this.scenes.load
	}

	protected destroyDialogue(): void {
		this.scenes.dialogue?.destroy()
		delete this.scenes.dialogue
	}
}
