/* eslint-disable */

//
// CODE JUST TO CREATE A TEXTURE
//

import { Application, Container, Graphics, Texture } from 'pixi.js'

const CARD_WIDTH = 300
const CARD_HEIGHT = 420
const CARD_RADIUS = 20
const PADDING = 15

// Colors
const COLOR_BASE_WHITE = 0xfdfdfd
const COLOR_PATTERN_MAIN = 0x2c3e90 // Royal Blue
const COLOR_GOLD = 0xd4af37

export function createCardBack(app: Application): Texture {
	// 1b. Add a thin, dark outline for card stacking visibility
	const outline = new Graphics()
		.roundRect(
			-CARD_WIDTH / 2,
			-CARD_HEIGHT / 2,
			CARD_WIDTH,
			CARD_HEIGHT,
			CARD_RADIUS,
		)
		.stroke({ width: 1.5, color: 0x222222, alpha: 0.85 })
	const container = new Container()

	// 1. The physical card base (White paper)
	const base = new Graphics()
		.roundRect(
			-CARD_WIDTH / 2,
			-CARD_HEIGHT / 2,
			CARD_WIDTH,
			CARD_HEIGHT,
			CARD_RADIUS,
		)
		.fill({ color: COLOR_BASE_WHITE })

	// Add a subtle shadow to the base graphics context if desired,
	// but usually shadows are handled by the container in the scene.

	// 2. The Inner Border (Pattern Area Background)
	const innerWidth = CARD_WIDTH - PADDING * 2
	const innerHeight = CARD_HEIGHT - PADDING * 2

	const patternBg = new Graphics()
		.roundRect(
			-innerWidth / 2,
			-innerHeight / 2,
			innerWidth,
			innerHeight,
			CARD_RADIUS / 1.5,
		)
		.fill({ color: COLOR_PATTERN_MAIN })

	// 4. Ornate Center Piece (Geometric Mandalas)
	const centerDecor = new Graphics()
	const circleCount = 3

	for (let i = 0; i < circleCount; i++) {
		const r = 40 + i * 25
		centerDecor
			.circle(0, 0, r)
			.stroke({ width: 2, color: COLOR_BASE_WHITE, alpha: 0.8 })

		// Decorative dots on the rings
		const dots = 8 + i * 4
		for (let j = 0; j < dots; j++) {
			const angle = (j / dots) * Math.PI * 2
			const dx = Math.cos(angle) * r
			const dy = Math.sin(angle) * r
			centerDecor.circle(dx, dy, 3).fill({ color: COLOR_GOLD })
		}
	}

	// Assemble Back
	container.addChild(base)
	container.addChild(outline)
	container.addChild(patternBg)
	container.addChild(centerDecor) // Add on top

	// Add White Border Stroke around the blue area
	const innerStroke = new Graphics()
		.roundRect(
			-innerWidth / 2,
			-innerHeight / 2,
			innerWidth,
			innerHeight,
			CARD_RADIUS / 1.5,
		)
		.stroke({ width: 2, color: COLOR_BASE_WHITE })
	container.addChild(innerStroke)

	const texture = app.renderer.generateTexture(container)
	container.destroy(true)
	return texture
}
