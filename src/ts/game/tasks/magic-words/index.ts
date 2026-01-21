import { Assets, Container } from 'pixi.js'
import { Data } from './data.js'
import { Dialogue } from './dialogue/index.js'
import { LoadForTask } from '../load.js'

export class MagicWordsTask {
	public readonly viewObject: Container
	protected loadPromise?: Promise<void>
	protected loadForTask?: LoadForTask
	protected dialogue?: Dialogue<Data>
	// We save this data because objects are created dynamically and need the value set immediately
	protected lastResizeData?: {
		readonly width: number
		readonly height: number
	}
	protected readonly endpoint: string
	protected readonly data: Data
	// Can be overridden in subclasses to customize behavior
	protected readonly static: typeof MagicWordsTask

	public constructor() {
		this.static = MagicWordsTask
		this.endpoint =
			'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords'
		this.viewObject = new Container()
		this.data = new Data()
	}

	protected static async urlToBase64(url: string): Promise<string> {
		const blob = await (await fetch(url)).blob()

		// Use FileReader to read the blob
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = (): void => {
				const { result } = reader
				if (result === null) {
					reject(new Error('Failed to convert blob to base64'))
					return
				} else if (typeof result !== 'string') {
					const textDecoder = new TextDecoder()
					resolve(textDecoder.decode(result))
					return
				}
				resolve(result)
			}
			reader.onerror = reject
			reader.readAsDataURL(blob)
		})
	}

	public async load(): Promise<void> {
		if (this.loadPromise) {
			return this.loadPromise
		}
		this.loadPromise = (async (): Promise<void> => {
			const response = await fetch(this.endpoint)
			if (!response.ok) {
				throw new Error(
					`HTTP error ${response.status}: ${response.statusText}`,
				)
			}
			this.data.parse(await response.json())
			await Promise.all([this.loadEmojies(), this.loadAvatars()])
		})()
		return this.loadPromise
	}

	public resize(width: number, height: number): void {
		this.lastResizeData = { height, width }
		this.loadForTask?.resize(width, height)
		this.dialogue?.resize(width, height)
	}

	public async display(): Promise<void> {
		this.displayLoading()
		await this.load()
		this.displayDialogue()
		this.destroyLoadForTask()
	}

	public destroy(): void {
		this.destroyLoadForTask()
		this.destroyDialogue()
		this.viewObject.destroy(true)
	}

	protected displayLoading(): void {
		this.loadForTask ??= new LoadForTask()
		const noSize = 0
		this.loadForTask.resize(
			this.lastResizeData?.width ?? noSize,
			this.lastResizeData?.height ?? noSize,
		)
		this.loadForTask.display()
		this.viewObject.addChild(this.loadForTask.viewObject)
	}

	protected displayDialogue(): void {
		const noSize = 0
		this.dialogue ??= new Dialogue(this.data)
		this.dialogue.resize(
			this.lastResizeData?.width ?? noSize,
			this.lastResizeData?.height ?? noSize,
		)
		this.dialogue.display()
		this.viewObject.addChild(this.dialogue.viewObject)
	}

	protected destroyLoadForTask(): void {
		this.loadForTask?.destroy()
		delete this.loadForTask
	}

	protected destroyDialogue(): void {
		this.dialogue?.destroy()
		delete this.dialogue
	}

	protected async loadEmojies(): Promise<void> {
		if (!this.data.emojies.length) {
			return
		}

		const results = await Promise.all(
			this.data.emojies.map(
				async (emoji: {
					readonly url: string
					readonly name: string
				}): Promise<{ name: string; base64: string }> => {
					const base64Data = await this.static.urlToBase64(emoji.url)
					return {
						base64: base64Data,
						name: emoji.name,
					}
				},
			),
		)
		results.every(
			(el: {
				readonly name: string
				readonly base64: string
			}): boolean => {
				this.data.addBase64ToEmojie(el.name, el.base64)
				return true
			},
		)
	}

	protected async loadAvatars(): Promise<void> {
		await Promise.all(
			this.data.avatars.map(
				async (avatar: { readonly url: string }): Promise<void> =>
					Assets.load({
						parser: 'texture',
						src: avatar.url,
					}),
			),
		)
	}
}
