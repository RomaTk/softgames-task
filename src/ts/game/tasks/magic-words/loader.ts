import { Assets } from 'pixi.js'
import { Data } from './data.js'
import { convertUrlToBase64 } from './url-to-base64.js'

export class Loader {
	public readonly afterLoadPromise: Promise<void>
	// This error will be used to indicate that loader is destroyed during loading, it can be expected behavior, so it is public
	public readonly destroyDuringLoadingError: Error
	protected isDestroyed: boolean
	protected readonly loadedAvatarsURLs: Set<string>
	protected readonly contingent: { data?: Data }

	public constructor(dialogueEndpoint: string) {
		this.contingent = {}
		this.isDestroyed = false
		this.destroyDuringLoadingError = new Error(
			'Loader was destroyed during loading',
		)
		this.loadedAvatarsURLs = new Set()
		this.afterLoadPromise = this.load(dialogueEndpoint)
	}

	public get afterLoad(): Promise<void> {
		return this.afterLoadPromise
	}

	public get data(): Data {
		if (this.isDestroyed) {
			throw new Error(
				'Loader is destroyed, not expected to get data after that',
			)
		}

		if (!this.contingent.data) {
			throw new Error('Data not loaded yet')
		}
		return this.contingent.data
	}

	public async destroy(): Promise<void> {
		if (this.isDestroyed) {
			return
		}
		this.isDestroyed = true

		await Promise.all(
			this.loadedAvatarsURLs.values().map(
				async (url: string): Promise<void> =>
					Assets.unload({
						parser: 'texture',
						src: url,
					}),
			),
		)

		this.loadedAvatarsURLs.clear()
		delete this.contingent.data
	}

	// It will reject the promise afterLoad (expected to be thrown only in load method)
	protected throwErrorIfDestroyedDuringLoading(): void {
		if (this.isDestroyed) {
			throw this.destroyDuringLoadingError
		}
	}

	protected async load(dialogueEndpoint: string): Promise<void> {
		// Not to continue if destroyed during async operations
		this.throwErrorIfDestroyedDuringLoading()

		await (async (response: {
			readonly json: () => Promise<unknown>
			readonly ok: boolean
			readonly status: number
			readonly statusText: string
		}): Promise<void> => {
			// Not to continue if destroyed during async operations
			if (this.isDestroyed) {
				return
			}

			if (!response.ok) {
				throw new Error(
					`HTTP error ${response.status}: ${response.statusText}`,
				)
			}

			await (async (json: unknown): Promise<void> => {
				// Not to continue if destroyed during async operations
				if (this.isDestroyed) {
					return
				}
				this.contingent.data = new Data(json)
				await Promise.all([this.loadEmojies(), this.loadAvatars()])
			})(await response.json())
		})(await fetch(dialogueEndpoint))

		// Not to continue if destroyed during async operations
		this.throwErrorIfDestroyedDuringLoading()
	}

	protected async loadEmojies(): Promise<void> {
		if (!this.data.emojies.length) {
			// Nothing to load
			return
		}

		const results = await Promise.all(
			// Create array of promises
			this.data.emojies.map(
				async (emoji: {
					readonly url: string
					readonly name: string
				}): Promise<{ name: string; base64: string } | null> => {
					// Not to continue if destroyed during async operations
					if (this.isDestroyed) {
						return null
					}
					const base64Data = await convertUrlToBase64(emoji.url)
					return {
						base64: base64Data,
						name: emoji.name,
					}
				},
			),
		)
		// Not to continue if destroyed during async operations
		if (this.isDestroyed) {
			return
		}
		// Add base64 data to emojis
		results.forEach(
			(
				el: { readonly name: string; readonly base64: string } | null,
			): void => {
				if (!el) {
					throw new Error(
						'Emoji loading was interrupted due to destruction, this should not happen here',
					)
				}
				this.data.addBase64ToEmoji(el.name, el.base64)
			},
		)
	}

	protected async loadAvatars(): Promise<void> {
		await Promise.all(
			this.data.avatars.map(
				async (avatar: { readonly url: string }): Promise<void> => {
					await Assets.load({
						parser: 'texture',
						src: avatar.url,
					})
					// We add it only after successful loading
					this.loadedAvatarsURLs.add(avatar.url)
				},
			),
		)
	}
}
