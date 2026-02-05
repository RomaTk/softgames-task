import { Graphics } from 'pixi.js'

export const create = (position: 'left' | 'right'): Graphics => {
	const cornerRect = new Graphics({
		layout: {
			position: 'absolute',
			...((): { right?: number; left?: number } => {
				if (position === 'left') {
					return { left: 0 }
				}
				return { right: 0 }
			})(),
			bottom: 0,
			height: '50%',
			objectFit: 'fill',
			width: '50%',
		},
	})
	// Func to write rectangle
	return ((): Graphics => {
		const bounds = {
				height: 20,
				width: 20,
				xPos: 0,
				yPos: 0,
			},
			color = 0x4a148c
		return cornerRect
			.rect(bounds.xPos, bounds.yPos, bounds.width, bounds.height)
			.fill(color)
	})()
}
