import { Container } from 'pixi.js'
import { MenuSelector } from './menu-selector/index.js'

export class Menu {
	public readonly viewObject: Container
	protected readonly menuSelector: MenuSelector

	public constructor() {
		this.viewObject = new Container()
		this.menuSelector = new MenuSelector()
	}

	public display(): void {
		this.menuSelector.display()
		this.viewObject.addChild(this.menuSelector.viewObject)
	}

	public resize(width: number, height: number): void {
		this.viewObject.layout = {
			height,
			position: 'absolute',
			width,
		}
	}

	public destroy(): void {
		this.menuSelector.destroy()
		this.viewObject.destroy(true)
	}
}
