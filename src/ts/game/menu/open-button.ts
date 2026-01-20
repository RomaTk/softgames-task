import { Container, Graphics } from 'pixi.js'
import Emittery from 'emittery'

export type TMenuOpenButtonEvents = {
	buttonClicked: null
}

export class MenuOpenButton {
	protected static graphicConfig = {
		circle: {
			color: 0x945201,
			radius: 30,
			xPos: 0,
			yPos: 0,
		},
		rect1: {
			color: 0xe3af02,
			height: 10,
			width: 30,
			xPos: -15,
			yPos: -20,
		},
		rect2: {
			color: 0xe3af02,
			height: 10,
			width: 30,
			xPos: -15,
			yPos: -5,
		},
		rect3: {
			color: 0xe3af02,
			height: 10,
			width: 30,
			xPos: -15,
			yPos: 10,
		},
	}
	public readonly viewObject: Container
	public readonly emitter: Emittery<TMenuOpenButtonEvents>
	// So can be changed in subclasses
	protected static: typeof MenuOpenButton
	protected readonly graphic: Graphics

	public constructor() {
		this.static = MenuOpenButton
		this.viewObject = new Container()
		this.graphic = this.static.createGraphic()
		this.emitter = new Emittery()
	}

	protected static createGraphic(): Graphics {
		const graphic = new Graphics()
		graphic
			.circle(
				this.graphicConfig.circle.xPos,
				this.graphicConfig.circle.yPos,
				this.graphicConfig.circle.radius,
			)
			.fill(this.graphicConfig.circle.color)
			.rect(
				this.graphicConfig.rect1.xPos,
				this.graphicConfig.rect1.yPos,
				this.graphicConfig.rect1.width,
				this.graphicConfig.rect1.height,
			)
			.fill(this.graphicConfig.rect1.color)
			.rect(
				this.graphicConfig.rect2.xPos,
				this.graphicConfig.rect2.yPos,
				this.graphicConfig.rect2.width,
				this.graphicConfig.rect2.height,
			)
			.fill(this.graphicConfig.rect2.color)
			.rect(
				this.graphicConfig.rect3.xPos,
				this.graphicConfig.rect3.yPos,
				this.graphicConfig.rect3.width,
				this.graphicConfig.rect3.height,
			)
			.fill(this.graphicConfig.rect3.color)
		return graphic
	}

	public show(): void {
		this.viewObject.visible = true
	}

	public hide(): void {
		this.viewObject.visible = false
	}

	public display(isVisible: boolean): void {
		this.viewObject.layout = {
			height: 70,
			maxHeight: '20%',
			maxWidth: '20%',
			padding: 10,
			position: 'relative',
			width: 70,
		}
		this.graphic.layout = {
			height: '100%',
			objectFit: 'contain',
			width: '100%',
		}

		this.viewObject.addChild(this.graphic)
		this.viewObject.visible = isVisible
		this.viewObject.interactive = true
		this.viewObject.cursor = 'pointer'
		this.viewObject.addEventListener('pointertap', () => {
			this.emitter.emit('buttonClicked', null).catch((err: unknown) => {
				console.error(err)
			})
		})
	}

	public destroy(): void {
		this.graphic.destroy(true)
		this.viewObject.destroy(true)
		this.emitter.clearListeners()
	}
}
