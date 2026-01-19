import '@pixi/layout'
import { Application } from 'pixi.js'
import { Menu } from './menu/index.js'

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

	public constructor() {
		this.application = new Application()
		this.menu = new Menu()
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
		this.menu.resize(
			this.application.renderer.width,
			this.application.renderer.height,
		)
	}

	public display(): void {
		this.menu.display()
		this.application.stage.addChild(this.menu.viewObject)
	}

	public destroy(): void {
		this.application.destroy(true)
	}
}
