import { Container, Sprite, Texture } from 'pixi.js'
import { MenuSelectorButton, type TMenuSelectorButtonEvents } from './button.js'
import type Emittery from 'emittery'

export type TMenuSelectorButtonConfig = {
	readonly label: string
	readonly onClick: () => void | Promise<void>
}

export class MenuSelector {
	public readonly viewObject: Container
	// So can be changed in subclasses
	protected static: typeof MenuSelector
	protected readonly bg: Sprite
	// Use array, as sequence of buttons matters
	protected readonly buttons: MenuSelectorButton[]
	protected readonly buttonToConfig: WeakMap<
		object,
		TMenuSelectorButtonConfig
	>

	// Use array, as sequence of buttons matters
	public constructor(config: readonly TMenuSelectorButtonConfig[]) {
		this.static = MenuSelector
		this.viewObject = new Container()
		this.bg = new Sprite(Texture.WHITE)

		const { arr, buttonToConfig } = this.static.createButtons(config)
		this.buttons = arr
		this.buttonToConfig = buttonToConfig

		this.subscribeOnClick()
	}

	protected static createButtons(
		configs: readonly TMenuSelectorButtonConfig[],
	): {
		arr: MenuSelectorButton[]
		buttonToConfig: WeakMap<MenuSelectorButton, TMenuSelectorButtonConfig>
	} {
		const buttonToConfig = new WeakMap<
				MenuSelectorButton,
				TMenuSelectorButtonConfig
			>(),
			buttons: MenuSelectorButton[] = []

		for (const config of configs) {
			const button = new MenuSelectorButton(config.label)
			buttons.push(button)
			buttonToConfig.set(button, config)
		}
		return {
			arr: buttons,
			buttonToConfig,
		}
	}

	public display(isVisible: boolean): void {
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
		this.viewObject.visible = isVisible
		this.displayBg()
		this.displayButtons()
	}

	public close(): void {
		this.viewObject.visible = false
	}

	public open(): void {
		this.viewObject.visible = true
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
		this.bg.interactive = true
		this.bg.tint = 0x945201
		this.viewObject.addChild(this.bg)
	}

	protected subscribeOnClick(): void {
		this.buttons.forEach(
			(button: {
				readonly emitter: Emittery<TMenuSelectorButtonEvents>
			}) => {
				button.emitter.on('buttonClicked', async () => {
					await this.buttonToConfig.get(button)?.onClick()
				})
			},
		)
	}
}
