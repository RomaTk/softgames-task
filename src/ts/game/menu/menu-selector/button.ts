import { Container, Sprite, Text, Texture } from 'pixi.js'

export class MenuSelectorButton {
	public readonly viewObject: Container
	// So can be changed in subclasses
	protected static: typeof MenuSelectorButton
	protected readonly label: Text
	protected readonly bg: Sprite

	public constructor(label: string) {
		this.static = MenuSelectorButton
		this.viewObject = new Container()
		this.label = new Text({ text: label })
		this.bg = new Sprite(Texture.WHITE)
	}

	public display(): void {
		this.viewObject.layout = {
			alignItems: 'center',
			display: 'flex',
			height: '20%',
			justifyContent: 'center',
			width: '90%',
		}

		this.bg.layout = {
			height: '100%',
			position: 'absolute',
			width: '100%',
		}
		this.bg.tint = 0xe3af02

		this.viewObject.addChild(this.bg)

		this.label.layout = {
			alignSelf: 'center',
			maxHeight: '95%',
			width: '95%',
		}
		this.label.style.fill = '#ffffff'
		this.viewObject.addChild(this.label)
	}

	public destroy(): void {
		this.label.destroy(true)
		this.bg.destroy(true)
		this.viewObject.destroy(true)
	}
}
