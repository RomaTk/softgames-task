import '@pixi/layout'
import * as Pixi from 'pixi.js'
import { Application } from 'pixi.js'
import { MagicWordsTask } from './tasks/magic-words/index.js'
import { Menu } from './menu/index.js'
import { OnTickResizeObserver } from './resize-observer.js'
import { AceOfShadowsTask } from './tasks/ace-of-shadows/index.js'
import { PixiPlugin } from 'gsap/PixiPlugin'
import { gsap } from 'gsap'
gsap.registerPlugin(PixiPlugin)
PixiPlugin.registerPIXI(Pixi)

export type TLoadStatus =
	| {
			loaded: true
	  }
	| {
			loaded: false
			error?: unknown
	  }

export class Game {
	protected loadPromise?: Promise<TLoadStatus>
	protected readonly application: Application
	protected readonly menu: Menu
	protected readonly resizeObserver: OnTickResizeObserver
	// Max size in pixels for width or height
	protected readonly maxPixelsSize: number
	protected readonly tasks: Set<
		MagicWordsTask | AceOfShadowsTask<Application>
	>

	public constructor() {
		this.application = new Application()
		this.menu = new Menu({
			tasks: [
				{
					label: 'Ace of Shadows',
					launchTask: (): void => {
						console.log('Ace of Shadows clicked')
					},
				},
				{
					label: 'Magic Words',
					launchTask: (): void => {
						console.log('Magic Words clicked')
					},
				},
				{
					label: 'Phoenix Flame',
					launchTask: (): void => {
						console.log('Phoenix Flame clicked')
					},
				},
			],
		})
		this.tasks = new Set()
		this.maxPixelsSize = 2000
		this.resizeObserver = new OnTickResizeObserver(() => {
			this.resize()
		})
	}

	public get canvas(): HTMLCanvasElement {
		return this.application.canvas
	}

	public async load(): Promise<TLoadStatus> {
		if (this.loadPromise) {
			return this.loadPromise
		}
		this.loadPromise = new Promise<TLoadStatus>((resolve) => {
			this.application
				.init()
				.then(() => {
					resolve({ loaded: true })
				})
				.catch((err: unknown) => {
					// Here is used resolve, as it could be error like in loading assets and we want to handle it gracefully
					resolve({ error: err, loaded: false })
				})
		}).catch((err: unknown) => {
			throw err
		})
		return this.loadPromise
	}

	public resize(): void {
		this.application.renderer.resize(
			document.body.clientWidth,
			document.body.clientHeight,
			this.calcResize(),
		)
		this.application.canvas.style.width = `${document.body.clientWidth}px`
		this.application.canvas.style.height = `${document.body.clientHeight}px`
		this.menu.resize(document.body.clientWidth, document.body.clientHeight)
		this.tasks.forEach(
			(task: {
				readonly resize: (width: number, height: number) => void
			}) => {
				task.resize(
					document.body.clientWidth,
					document.body.clientHeight,
				)
			},
		)
	}

	public display(): void {
		this.menu.display(false)
		this.launchAceOfShadowsTask()
		// this.launchMagicWordsTask().catch((err: unknown) => {
		// 	console.error('Failed to launch Magic Words task', err)
		// })
		this.application.stage.addChild(this.menu.viewObject)
		this.resizeObserver.observe(document.body)
	}

	public destroy(): void {
		this.resizeObserver.disconnect()
		this.menu.destroy()
		this.application.destroy(true)
	}

	protected calcResize(): number {
		const providedMaxSide =
			Math.max(document.body.clientWidth, document.body.clientHeight) *
			window.devicePixelRatio

		if (providedMaxSide <= this.maxPixelsSize) {
			return window.devicePixelRatio
		}

		return window.devicePixelRatio * (this.maxPixelsSize / providedMaxSide)
	}

	protected async launchMagicWordsTask(): Promise<void> {
		const task = new MagicWordsTask()
		this.tasks.add(task)
		task.resize(document.body.clientWidth, document.body.clientHeight)
		const toAwait = task.display()
		this.application.stage.addChild(task.viewObject)
		await toAwait
	}

	protected launchAceOfShadowsTask(): void {
		const task = new AceOfShadowsTask(this.application)
		this.tasks.add(task)
		task.resize(document.body.clientWidth, document.body.clientHeight)
		task.display()
		this.application.stage.addChild(task.viewObject)
	}
}
