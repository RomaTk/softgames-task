import { type FC, type ReactNode, useEffect, useRef } from 'react'
import { ErrorCatcher } from '../game/error-catcher.js'
import { Game as PixiGame } from '../game/index.js'

const exportObjects = ((): { ComponentGame: FC; game: PixiGame } => {
	const game = new PixiGame()
	return {
		ComponentGame: (): ReactNode => {
			const containerRef = useRef<HTMLDivElement>(null)

			useEffect(() => {
				const currentDiv = containerRef.current
				if (currentDiv) {
					currentDiv.appendChild(game.canvas)
					// game.canvas.addEventListener(
					// 	'click',
					// 	() => {
					// 		game.canvas
					// 			.requestFullscreen()
					// 			.catch((err: unknown) => {
					// 				// POSSIBLE_BUG Delay as error was thrown even though fullscreen was successful (randomly on some devices/browsers)
					// 				const delay = 100
					// 				setTimeout(() => {
					// 					if (
					// 						document.fullscreenElement ===
					// 						game.canvas
					// 					) {
					// 						return
					// 					}
					// 					ErrorCatcher.instance.throw(err, true)
					// 				}, delay)
					// 			})
					// 	},
					// 	{
					// 		once: true,
					// 	},
					// )
				}
			}, [])

			return <div ref={containerRef} />
		},
		game,
	}
})()
export default exportObjects
