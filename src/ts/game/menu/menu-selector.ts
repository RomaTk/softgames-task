import { Container, Sprite, Texture } from 'pixi.js'

export class MenuSelector {
	public readonly viewObject: Container
	// So can be changed in subclasses
	protected static: typeof MenuSelector
	protected readonly bg: Sprite

	public constructor() {
		this.viewObject = new Container()
		this.static = MenuSelector
		this.bg = this.static.createBackground()
	}

	protected static createBackground(): Sprite {
		const sprite = new Sprite(Texture.WHITE)
		sprite.tint = 0x00ff00
		return sprite
	}

	public display(): void {
		this.viewObject.addChild(this.bg)
	}

	public resize(width: number, height: number): void {
		this.viewObject.layout = {
			height,
			width,
		}
		this.bg.layout = {
			height: '90%',
			width: '90%',
		}
	}

	public destroy(): void {
		this.viewObject.destroy(true)
	}
}
