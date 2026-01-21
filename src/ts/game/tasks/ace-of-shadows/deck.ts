import { Container, Sprite } from 'pixi.js'

export type TPropertiesForTopCard = {
	position: { x: number; y: number }
	skew: { x: number; y: number }
	rotation: number
}

export class Deck extends Container {
	protected readonly cardsSkew: { x: number; y: number }

	public constructor(cardsSkew?: { readonly x: number; readonly y: number }) {
		super()
		this.cardsSkew = cardsSkew ?? {
			x: (Math.random() - 0.5) * 0.5,
			y: (Math.random() - 0.5) * 0.5,
		}
	}

	public get countCards(): number {
		return this.children.length
	}

	public addCard(card: Sprite, initial: boolean): void {
		if (initial) {
			const properties = this.getPropertiesForTopCard(card, 0)
			card.position.set(properties.position.x, properties.position.y)
			card.rotation = properties.rotation
			card.skew.y = properties.skew.y
			card.skew.x = properties.skew.x
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
		return {
			position: {
				y:
					-(this.countCards + cardsInFly) *
					card.texture.height *
					0.005,
				x: -(this.countCards + cardsInFly) * card.texture.width * 0.005,
			},
			skew: { y: this.cardsSkew.y, x: this.cardsSkew.x },
			rotation: (Math.random() - 0.5) * 0.02,
		}
	}
}
