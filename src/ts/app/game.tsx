import { type FC, type ReactNode, useEffect, useRef } from 'react'
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
				}
			}, [])

			return <div ref={containerRef} />
		},
		game,
	}
})()
export default exportObjects
