import { Texture } from 'pixi.js'

export const getAvatarTexture = (url: string | null): Texture => {
	if (url === null) {
		return Texture.WHITE
	}
	return Texture.from(url)
}
