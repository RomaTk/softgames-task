import { type Application, Container, Graphics, type Texture } from 'pixi.js'

export const createFireTexture = (app: Application, size: number): Texture => {
	const center = ((): number => {
			const halfSizeFactor = 2
			return size / halfSizeFactor
		})(),
		graphicsToTexture = new Graphics(),
		sizes = {
			large: 0.5,
			medium: 0.3,
			small: 0.1,
		}

	graphicsToTexture
		.circle(center, center, size * sizes.large)
		.fill({ alpha: 0.4, color: 0xff3c00 })
	graphicsToTexture
		.circle(center, center, size * sizes.medium)
		.fill({ alpha: 0.8, color: 0xffa000 })
	graphicsToTexture
		.circle(center, center, size * sizes.small)
		.fill({ alpha: 1.0, color: 0xffffc8 })

	return app.renderer.generateTexture(
		new Container().addChild(graphicsToTexture),
	)
}
