import { Container } from 'pixi.js'
import { MenuSelector } from './menu-selector.js'

export class Menu {
	public readonly viewObject: Container
	public readonly menuSelector: MenuSelector

	public constructor() {
		this.viewObject = new Container()
		this.menuSelector = new MenuSelector()
	}

	public display(): void {
		this.menuSelector.display()
		this.viewObject.addChild(this.menuSelector.viewObject)
	}

	public resize(width: number, height: number): void {
		this.menuSelector.resize(width, height)
	}

	public destroy(): void {
		this.menuSelector.destroy()
		this.viewObject.destroy(true)
	}
}
