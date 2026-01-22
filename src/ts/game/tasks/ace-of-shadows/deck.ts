import { Container, Sprite } from 'pixi.js'

export type TPropertiesForTopCard = {
	position: { x: number; y: number }
	skew: { x: number; y: number }
	rotation: number
}

export class Deck extends Container {
	protected readonly cardsSkew: { x: number; y: number }

	public constructor(cardsSkew: { readonly x: number; readonly y: number }) {
		super()
		this.cardsSkew = cardsSkew
	}

	public get countCards(): number {
		return this.children.length
	}

	public addCard(card: Sprite, initial: boolean): void {
		if (initial) {
			const properties = ((): TPropertiesForTopCard => {
				const noCardsInFly = 0
				return this.getPropertiesForTopCard(card, noCardsInFly)
			})()
			card.position.set(properties.position.x, properties.position.y)
			card.rotation = properties.rotation
			card.skew.set(properties.skew.x, properties.skew.y)
		} else {
			card.position.set(
				card.x - this.position.x,
				card.y - this.position.y,
			)
		}
		this.addChild(card)
	}

	public getTopCard(): Sprite {
		if (!this.countCards) {
			throw new Error('No cards in the deck')
		}

		const topCardIndex = 0
		return ((): Sprite => {
			const card = this.getCardByIndex(topCardIndex)

			this.removeChild(card)
			return card
		})()
	}

	public getCardByIndex(indexFromTop: number): Sprite {
		const topReducer = 1
		return ((): Sprite => {
			const card = this.getChildAt(
				this.countCards - topReducer - indexFromTop,
			)
			if (!(card instanceof Sprite)) {
				throw new Error('Card is not a Sprite')
			}
			return card
		})()
	}

	public getPropertiesForTopCard(
		card: Sprite,
		cardsInFly: number,
	): TPropertiesForTopCard {
		const byPositionFactor = 0.005,
			byRotationFactor = 0.02,
			halfOfRandomRange = 0.5
		return {
			position: {
				[`x`]:
					-(this.countCards + cardsInFly) *
					card.texture.width *
					byPositionFactor,
				[`y`]:
					-(this.countCards + cardsInFly) *
					card.texture.height *
					byPositionFactor,
			},
			rotation: (Math.random() - halfOfRandomRange) * byRotationFactor,
			skew: { ...this.cardsSkew },
		}
	}
}
