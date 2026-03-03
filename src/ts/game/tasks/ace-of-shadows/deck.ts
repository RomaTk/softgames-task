import type { TCard, TClosingProps } from './card.js'
import { Container } from 'pixi.js'

export type TOptions = {
	readonly cardsSkew: { readonly x: number; readonly y: number }
	readonly cardSize: { readonly width: number; readonly height: number }
}

export type TDeck<CardLike extends TCard> = {
	readonly getProperties: (cardIndex: number) => TClosingProps
} & Container<CardLike>

export class Deck<CardLike extends TCard, OptionsLike extends TOptions>
	extends Container<CardLike>
	implements TDeck<CardLike>
{
	protected readonly cardsSkew: OptionsLike['cardsSkew']
	protected readonly cardSize: OptionsLike['cardSize']

	public constructor(options: OptionsLike) {
		super()
		this.cardsSkew = options.cardsSkew
		this.cardSize = options.cardSize
	}

	public getProperties(cardIndex: number): TClosingProps {
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

	public override addChild(
		...children: readonly CardLike[]
	): ReturnType<Container<CardLike>['addChild']> {
		children.forEach((child, index) => {
			// If it is already in the scene, we need to swap the positions to avoid jumps
			if (child.parent) {
				const wasFinalPosition = child.finalPos
				child.finalPos = child.startPos
				child.startPos = wasFinalPosition
				return
			}
			child.startPos = this.getProperties(this.children.length + index)
		})
		return super.addChild(...children)
	}

	public override destroy(): void {
		this.children.forEach((child) => {
			child.destroy()
		})
		super.destroy()
	}
}
