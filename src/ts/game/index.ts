import { Application } from 'pixi.js'

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

	public constructor() {
		this.application = new Application()
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

	public destroy(): void {
		this.application.destroy(true)
	}
}
