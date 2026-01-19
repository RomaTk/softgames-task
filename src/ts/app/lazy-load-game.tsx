import { type FC, lazy } from 'react'
import type { TLoadStatus } from '../game/index.js'

export const ComponentGame = lazy(async () => {
	try {
		const module = await import('./game.js')
		return {
			default: await module.default.game
				.load()
				.then((errorResult: Readonly<TLoadStatus>) => {
					if (errorResult.loaded) {
						return module.default.ComponentGame
					}
					throw errorResult.error
				})
				.catch((err: unknown) => {
					module.default.game.destroy()
					throw err
				}),
		}
	} catch {
		const errorResult: { default: FC } = {
			default: () => <div>{'Failed to load game.'}</div>,
		}
		return errorResult
	}
})
