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
			height: '80%',
			width: '80%',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			flexDirection: 'column',
		}
		this.displayBg()
		this.viewObject.addChild(this.bg)
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
			width: '100%',
			position: 'absolute',
		}
		this.bg.tint = 0x333333
	}
}
