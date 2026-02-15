import '@pixi/layout'
import * as Pixi from 'pixi.js'
import { Application, Container } from 'pixi.js'
import { AceOfShadowsTask } from './tasks/ace-of-shadows/index.js'
import { ErrorCatcher } from './error-catcher.js'
import { FPSMeter } from './fps-meter.js'
import { MagicWordsTask } from './tasks/magic-words/index.js'
import { Menu } from './menu/index.js'
import { OnTickResizeObserver } from './resize-observer.js'
import { PhoenixFlameTask } from './tasks/phoenix-flame/index.js'
import { PixiPlugin } from 'gsap/PixiPlugin'
import { TaskSize } from './task-size.js'
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
export type TTask = {
	readonly destroy: () => void
	readonly resize: (width: number, height: number) => void
}

export class Game {
	public readonly application: Application
	public readonly errorCatcher: ErrorCatcher
	protected loadPromise?: Promise<TLoadStatus>
	protected fpsMeter?: FPSMeter
	protected readonly menu: Menu
	protected readonly resizeObserver: OnTickResizeObserver
	// Max size in pixels for width or height
	protected readonly maxPixelsSize: number
	protected readonly tasks: Set<TTask>
	protected readonly tasksContainer: Pixi.Container

	public constructor() {
		this.errorCatcher = ErrorCatcher.instance
		this.errorCatcher.actionOnError = (): void => {
			const { parentElement } = this.application.canvas
			if (parentElement) {
				parentElement.textContent =
					'An error occurred. Please, reload the page.'
			}
			this.destroy()
		}
		this.application = new Application()
		this.menu = new Menu({
			tasks: [
				{
					label: 'Ace of Shadows',
					launchTask: (): void => {
						this.launchAceOfShadowsTask()
					},
				},
				{
					label: 'Magic Words',
					launchTask: async (): Promise<void> => {
						await this.launchMagicWordsTask()
					},
				},
				{
					label: 'Phoenix Flame',
					launchTask: (): void => {
						this.launchPhoenixFlameTask()
					},
				},
			],
		})
		this.tasksContainer = new Container()
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
		this.menu.display(true)
		this.application.stage.addChild(this.tasksContainer)
		this.application.stage.addChild(this.menu.viewObject)
		this.fpsMeter ??= new FPSMeter()
		this.application.stage.addChild(this.fpsMeter)
		this.resizeObserver.observe(document.body)
	}

	public destroy(): void {
		this.resizeObserver.disconnect()
		this.menu.destroy()
		this.destroyTasks()
		this.fpsMeter?.destroy()
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

	protected destroyTasks(except?: unknown): void {
		this.tasks.forEach((task: TTask) => {
			if (typeof except === 'function' && task instanceof except) {
				return
			}
			task.destroy()
			this.tasks.delete(task)
		})
	}

	protected isTaskRunning(taskClass: unknown): boolean {
		const found = this.tasks.values().find((task: TTask) => {
			if (typeof taskClass === 'function' && task instanceof taskClass) {
				return true
			}
			return false
		})
		if (found) {
			return true
		}
		return false
	}

	protected async launchMagicWordsTask(): Promise<void> {
		if (this.isTaskRunning(MagicWordsTask)) {
			return
		}
		const task = new MagicWordsTask(
			new TaskSize(
				() => document.body.clientHeight,
				() => document.body.clientWidth,
			),
			(err: unknown, isCritical: boolean) => {
				//TODO change it to effect only one task
				ErrorCatcher.instance.throw(err, !isCritical)
			},
		)
		this.tasks.add(task)
		await task.resize()
		this.tasksContainer.addChild(task.viewObject)
		this.destroyTasks(MagicWordsTask)
	}

	protected launchAceOfShadowsTask(): void {
		if (this.isTaskRunning(AceOfShadowsTask)) {
			return
		}
		const task = new AceOfShadowsTask(this.application)
		this.tasks.add(task)
		task.resize(document.body.clientWidth, document.body.clientHeight)
		task.display()
		this.tasksContainer.addChild(task.viewObject)
		this.destroyTasks(AceOfShadowsTask)
	}

	protected launchPhoenixFlameTask(): void {
		if (this.isTaskRunning(PhoenixFlameTask)) {
			return
		}
		const task = new PhoenixFlameTask(this.application)
		this.tasks.add(task)
		task.resize(document.body.clientWidth, document.body.clientHeight)
		this.tasksContainer.addChild(task.viewObject)
		this.destroyTasks(PhoenixFlameTask)
	}
}
