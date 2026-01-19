import { Container, Text } from 'pixi.js'

export class MenuSelectorButton {
	public readonly viewObject: Container
	// So can be changed in subclasses
	protected static: typeof MenuSelectorButton

	public constructor(label: string) {
		this.static = MenuSelectorButton
		this.viewObject = new Container()
		this.viewObject.addChild(
			new Text({ text: label, style: { fill: '#ffffff' } }),
		)
	}

	public display(): void {
		this.viewObject.layout = {
			height: 'intrinsic',
			width: 'intrinsic',
		}
	}

	public destroy(): void {
		this.viewObject.destroy(true)
	}
}
