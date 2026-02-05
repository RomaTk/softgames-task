import { Container, Ticker, type TickerCallback } from 'pixi.js'
import { Dialogue } from './components/dialogue/index.js'
import { LoadView } from './components/load/index.js'
import { Loader } from './loader.js'
import { staticFunctions as loadSceneStaticFunctions } from './components/load/static-fuctions.js'
import { getGrouppedOptions as getGrouppedOptionsDialogue } from './components/dialogue/static-functions/grouped-options.js'
import { PreciseSizeHelperCache } from './components/message/message-text/precise-size-helper/cache.js'
import { PreciseSizeHelper } from './components/message/message-text/precise-size-helper/index.js'
import { styleContentParser } from './components/message/message-text/precise-size-helper/style-content-parser.js'
import { ErrorCatcher } from '../../error-catcher.js'
import { Data } from './data.js'

export type TSize = {
	readonly width: number
	readonly height: number
}

const preciseHelper = new PreciseSizeHelper(
	styleContentParser,
	new PreciseSizeHelperCache<DOMRect>(10),
)

export class MagicWordsTask<SizeLike extends TSize> {
	public readonly viewObject: Container
	public readonly afterInitPromise: Promise<void>
	protected readonly loader: Loader
	protected readonly scenes: {
		dialogue?: Dialogue<SizeLike, Data>
		load?: LoadView<
			ReturnType<(typeof loadSceneStaticFunctions)['createCore']>,
			ReturnType<(typeof loadSceneStaticFunctions)['createSpinner']>,
			ReturnType<(typeof loadSceneStaticFunctions)['createViewObject']>,
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
		const load = new LoadView(
			loadSceneStaticFunctions,
			this.size,
			Ticker.shared,
		)
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
		this.scenes.dialogue = new Dialogue(
			{
				...getGrouppedOptionsDialogue<SizeLike>(
					this.size,
					{
						mapEmojiToBase64: {
							get: (name: string) =>
								this.data.getEmojieData(name)?.base64,
						},
						preciseSizeHelper: preciseHelper,
						throwNotCritical: (err: unknown) => {
							ErrorCatcher.instance.throw(err, true)
						},
					},
					(err: unknown) => {
						ErrorCatcher.instance.throw(err, true)
					},
				),
			},
			this.data,
		)
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
