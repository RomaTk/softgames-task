import { Container } from 'pixi.js'
import { MenuOpenButton } from './open-button.js'
import { MenuSelector } from './menu-selector/index.js'

export type TMenuTask = {
	readonly label: string
	readonly launchTask: () => void | Promise<void>
}

export type TMenuConfig = {
	readonly tasks: readonly TMenuTask[]
}

export class Menu {
	public readonly viewObject: Container
	// So can be changed in subclasses
	protected static: typeof Menu
	protected readonly menuSelector: MenuSelector
	protected readonly openButton: MenuOpenButton

	public constructor(config: TMenuConfig) {
		this.static = Menu
		this.viewObject = new Container()
		this.openButton = new MenuOpenButton()
		this.menuSelector = this.static.createMenuSelector(
			config,
			this.openButton,
		)
		this.subscribeOnClick()
	}

	protected static createMenuSelector(
		config: TMenuConfig,
		openButton: { readonly show: () => void },
	): MenuSelector {
		const menuSelector = new MenuSelector(
			config.tasks.map((task) => ({
				label: task.label,
				onClick: async (): Promise<void> => {
					menuSelector.close()
					openButton.show()
					await task.launchTask()
				},
			})),
		)
		return menuSelector
	}

	public display(isOpen: boolean): void {
		this.menuSelector.display(isOpen)
		this.viewObject.addChild(this.menuSelector.viewObject)
		this.openButton.display(!isOpen)
		this.viewObject.addChild(this.openButton.viewObject)
	}

	public resize(width: number, height: number): void {
		this.viewObject.layout = {
			height,
			position: 'absolute',
			width,
		}
	}

	public destroy(): void {
		this.openButton.destroy()
		this.menuSelector.destroy()
		this.viewObject.destroy(true)
	}

	protected subscribeOnClick(): void {
		this.openButton.emitter.on('buttonClicked', () => {
			this.menuSelector.open()
			this.openButton.hide()
		})
	}
}
