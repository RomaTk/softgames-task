import '@pixi/layout'
import { Application } from 'pixi.js'
import { Menu } from './menu/index.js'
import { OnTickResizeObserver } from './resize-observer.js'

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

	public constructor() {
		this.application = new Application()
		this.menu = new Menu()
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
	}

	public display(): void {
		this.menu.display()
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
}
