import { Container, Ticker, type TickerCallback } from 'pixi.js'
import type { Data } from './data.js'
import { Dialogue } from './dialogue.js'
import { LoadView } from './components/load/index.js'
import { Loader } from './loader.js'
import { staticFunctions as loadSceneStaticFunctions } from './components/load/static-fuctions.js'

export type TSize = {
	readonly width: number
	readonly height: number
}

export type TThrowErrorLike = (err: unknown, isCritical: boolean) => void

export class MagicWordsTask<
	SizeLike extends TSize,
	ThrowErrorLike extends TThrowErrorLike,
> {
	public readonly viewObject: Container
	public readonly afterInit: Promise<void>
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
	protected readonly throwError: ThrowErrorLike
	// We save this data because objects are created dynamically and need the value set immediately
	protected readonly size: SizeLike

	public constructor(size: SizeLike, throwError: ThrowErrorLike) {
		this.size = size
		this.throwError = throwError
		this.loader = new Loader(
			'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords',
		)
		this.viewObject = new Container()
		this.scenes = {}
		this.afterInit = this.init()
	}

	public async resize(): Promise<void> {
		this.scenes.load?.resize()
		await this.scenes.dialogue?.resize()
	}

	public async destroy(): Promise<void> {
		this.destroyLoadForTask()
		this.destroyDialogue()
		this.viewObject.destroy(true)
		await this.loader.destroy()
	}

	protected async init(): Promise<void> {
		if (this.viewObject.destroyed) {
			return
		}
		this.initLoadScene()
		await this.initLoder()
		await this.initDialogueScene()
		this.destroyLoadForTask()
	}

	protected initLoadScene(): void {
		this.scenes.load = new LoadView(
			loadSceneStaticFunctions,
			this.size,
			Ticker.shared,
		)
		this.viewObject.addChild(this.scenes.load.viewObject)
	}

	protected async initLoder(): Promise<void> {
		if (this.viewObject.destroyed) {
			return
		}
		try {
			await this.loader.afterLoad
		} catch (err: unknown) {
			if (err === this.loader.destroyDuringLoadingError) {
				// Expected behavior, do nothing
				return
			}
			// Here not all data loaded
			await this.destroy()
			this.throwError(err, true)
		}
	}

	protected async initDialogueScene(): Promise<void> {
		if (this.viewObject.destroyed) {
			return
		}
		this.scenes.dialogue = new Dialogue(
			this.size,
			this.loader.data,
			(err) => {
				this.throwError(err, false)
			},
		)
		// We need to add to scene, so scaling will happen (only after that object will be inited)
		this.scenes.dialogue.viewObject.alpha = 0
		this.viewObject.addChild(this.scenes.dialogue.viewObject)
		await this.scenes.dialogue.afterInit
		this.scenes.dialogue.viewObject.alpha = 1
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
