import { Container, Sprite, Texture } from 'pixi.js'
import { MenuSelectorButton } from './button.js'

export class MenuSelector {
	public readonly viewObject: Container
	// So can be changed in subclasses
	protected static: typeof MenuSelector
	protected readonly bg: Sprite
	// Use array, as sequence of buttons matters
	protected readonly buttons: MenuSelectorButton[]

	public constructor() {
		this.static = MenuSelector
		this.viewObject = new Container()
		this.bg = new Sprite(Texture.WHITE)
		this.buttons = this.static.createButtons([
			'Ace of Shadows',
			'Magic Words',
			'Phoen ix Flame',
		])
	}

	protected static createButtons(
		labels: readonly string[],
	): MenuSelectorButton[] {
		const buttons: MenuSelectorButton[] = []
		for (const label of labels) {
			const button = new MenuSelectorButton(label)
			buttons.push(button)
		}
		return buttons
	}

	public display(): void {
		this.viewObject.layout = {
			alignItems: 'center',
			display: 'flex',
			flexDirection: 'column',
			height: '80%',
			justifyContent: 'space-evenly',
			left: '10%',
			position: 'absolute',
			top: '10%',
			width: '80%',
		}
		this.displayBg()
		this.displayButtons()
	}

	public destroy(): void {
		this.buttons.forEach((button: { readonly destroy: () => void }) => {
			button.destroy()
		})
		this.bg.destroy(true)
		this.viewObject.destroy(true)
	}

	protected displayButtons(): void {
		for (const button of this.buttons) {
			this.viewObject.addChild(button.viewObject)
		}
		this.buttons.forEach((button: { readonly display: () => void }) => {
			button.display()
		})
	}

	protected displayBg(): void {
		this.bg.layout = {
			height: '100%',
			position: 'absolute',
			width: '100%',
		}
		this.bg.tint = 0x945201
		this.viewObject.addChild(this.bg)
	}
}
