import { LayoutSprite } from '@pixi/layout/components'
import type { Texture } from 'pixi.js'

export const create = (getTexture: () => Texture): LayoutSprite =>
	new LayoutSprite({
		layout: {
			alignSelf: 'flex-end',
			aspectRatio: 1,
			maxHeight: '50%',
			maxWidth: 100,
			minWidth: 50,
			objectFit: 'cover',
			width: '10%',
		},
		texture: getTexture(),
	})
