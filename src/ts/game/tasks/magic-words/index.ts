import { Assets, Container } from 'pixi.js'
import { Data } from './data.js'
import { Dialogue } from './dialogue/index.js'
import { LoadForTask } from '../load.js'

export class MagicWordsTask {
	public readonly viewObject: Container
	protected loadPromise?: Promise<void>
	protected loadForTask?: LoadForTask
	protected dialogue?: Dialogue<Data>
	// We save this data, as objects created dynamically and as soon as created - we need to set the value
	protected lastResizeData?: {
		readonly width: number
		readonly height: number
	}
	protected readonly endpoint: string
	protected readonly data: Data

	public constructor() {
		this.endpoint =
			'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords'
		this.viewObject = new Container()
		this.data = new Data()
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

	// Load emojis to browser cache, we predict that server sends correct data, so we load only what we need (no checks in dialogs)
	protected async loadEmojies(): Promise<void> {
		return new Promise((resolve, reject) => {
			const allCount = this.data.emojies.length,
				countIncrement = 1
			if (!allCount) {
				resolve()
				return
			}
			let loadedCount = 0

			this.data.emojies.forEach((emoji: { readonly url: string }) => {
				// Load by image as will be using html text (no sense in performance like bitmaps here)
				const img = new Image()
				img.onload = (): void => {
					loadedCount += countIncrement
					if (loadedCount >= allCount) {
						resolve()
					}
				}
				img.onerror = (): void => {
					reject(new Error(`Failed to load emoji ${emoji.url}`))
				}
				img.src = emoji.url
			})
		})
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
