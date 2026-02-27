import type { TCard, TClosingPosition } from './card.js'
import { Container } from 'pixi.js'

export type TOptions = {
	readonly cardsSkew: { readonly x: number; readonly y: number }
	readonly cardSize: { readonly width: number; readonly height: number }
}

export class Deck<
	CardLike extends TCard,
	OptionsLike extends TOptions,
> extends Container<CardLike> {
	protected readonly cardsSkew: OptionsLike['cardsSkew']
	protected readonly cardSize: OptionsLike['cardSize']

	public constructor(options: OptionsLike) {
		super()
		this.cardsSkew = options.cardsSkew
		this.cardSize = options.cardSize
	}

	public getProperties(cardIndex: number): TClosingPosition {
		const byPositionFactor = 0.005,
			byRotationFactor = 0.02,
			halfOfRandomRange = 0.5
		return {
			rotation: (Math.random() - halfOfRandomRange) * byRotationFactor,
			skewX: this.cardsSkew.x,
			skewY: this.cardsSkew.y,
			xPos: -cardIndex * this.cardSize.width * byPositionFactor,
			yPos: -cardIndex * this.cardSize.height * byPositionFactor,
		}
	}
}
