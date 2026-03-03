import { type Application, Container, type Texture } from 'pixi.js'
import { Card, type TCard } from './card.js'
import { Deck, type TDeck } from './deck.js'
import { FlyCards, type TFlyCards } from './fly-cards.js'
import { createCardBack } from './create-skin.js'
import { genRandomSkew } from './gen-random-skew.js'
import gsap from 'gsap'

export class AceOfShadowsTask<App extends Application> {
	public readonly viewObject: Container
	protected timeline?: gsap.core.Timeline
	protected readonly decks: {
		from: TDeck<TCard>
		to: TDeck<TCard>
	}
	protected readonly flyingCardsContainer: TFlyCards<TCard>
	protected readonly cardTexture: Texture
	protected readonly durationToFlyOneCard: number
	protected readonly delayBetweenCards: number

	public constructor(application: App) {
		this.viewObject = new Container()
		this.flyingCardsContainer = new FlyCards()
		this.cardTexture = createCardBack(application)
		this.durationToFlyOneCard = 2
		this.delayBetweenCards = 0.5
		const cardSizeToTextureMultiplier = 1,
			numberCards = 144
		this.decks = this.createDecks(cardSizeToTextureMultiplier)
		this.organizeViewObject()
		this.createAndFillCards(numberCards, cardSizeToTextureMultiplier)
	}

	public resize(width: number, height: number): void {
		const centerFactor = 0.5,
			defaultScale = 1,
			minHeight = 1000,
			minWidth = 2000

		this.viewObject.position.set(
			width * centerFactor,
			height * centerFactor,
		)

		if (width < minWidth || height < minHeight) {
			this.viewObject.scale.set(
				Math.min(width / minWidth, height / minHeight),
			)
			if (width < height) {
				this.viewObject.angle = 90
			} else {
				this.viewObject.angle = 0
			}
		} else {
			this.viewObject.scale.set(defaultScale)
		}
	}

	public destroy(): void {
		// Set max progress to end promise and kill
		const maxProgress = 1
		this.timeline?.progress(maxProgress).kill()
		this.decks.from.destroy()
		this.decks.to.destroy()
		this.flyingCardsContainer.destroy()
		this.viewObject.destroy()
		this.cardTexture.destroy(true)
	}

	public async play(): Promise<void> {
		await this.createTimeline()
	}

	protected createAndFillCards(
		numberCards: number,
		scaleMultiplier: number,
	): void {
		this.decks.from.addChild(
			...this.setFinalPositions([
				...this.createCards(numberCards, scaleMultiplier),
			]),
		)
	}

	protected setDecksPosition(): void {
		const distanceFromCenterX = 600,
			distanceFromCenterY = 0
		this.decks.from.position.set(-distanceFromCenterX, -distanceFromCenterY)
		this.decks.to.position.set(distanceFromCenterX, distanceFromCenterY)
	}

	protected organizeViewObject(): void {
		this.setDecksPosition()
		this.viewObject.addChild(
			this.decks.from,
			this.decks.to,
			this.flyingCardsContainer,
		)
	}

	protected async createTimeline(): Promise<void> {
		return new Promise((resolve, reject) => {
			// Set max progress to end promise and kill
			const maxProgress = 1
			this.timeline?.progress(maxProgress).kill()
			this.timeline = this.decks.from.children
				.map(<C extends TCard>(card: C) =>
					this.createTimeLineForOneCard(card, (err) => {
						reject(
							new Error(`Error creating timeline for card`, {
								cause: err,
							}),
						)
					}),
				)
				.reverse()
				.reduce(
					<T extends gsap.core.Timeline>(
						accum: T,
						current: { readonly timeline: T },
						index: number,
					) => {
						current.timeline.paused(false)
						accum.add(
							current.timeline,
							index * this.delayBetweenCards,
						)
						return accum
					},
					gsap.timeline({ paused: true }),
				)
			this.timeline.eventCallback('onUpdate', () => {
				try {
					this.flyingCardsContainer.sortCards()
				} catch (err: unknown) {
					reject(
						new Error(`Error sorting flying cards`, { cause: err }),
					)
				}
			})
			this.timeline
				.play()
				.then(() => {
					resolve()
				})
				.catch((err: unknown) => {
					reject(new Error(`Error playing timeline`, { cause: err }))
				})
		})
	}

	// eslint-disable-next-line max-lines-per-function
	protected createTimeLineForOneCard<C extends TCard>(
		card: C,
		errorCallback: (err: unknown) => void,
	): {
		timeline: gsap.core.Timeline
		card: C
	} {
		return {
			card,
			timeline: card.creatTimeLineForFlyToDeck({
				callBacks: {
					onComplete: () => {
						try {
							this.decks.to.addChild(card)
						} catch (err: unknown) {
							errorCallback(
								new Error(`Error adding card to deck`, {
									cause: err,
								}),
							)
						}
					},
					onStart: () => {
						try {
							this.flyingCardsContainer.addCard(card)
						} catch (err: unknown) {
							errorCallback(
								new Error(
									`Error adding card to flying container`,
									{
										cause: err,
									},
								),
							)
						}
					},
				},
				duration: this.durationToFlyOneCard,
				props: {
					final: (props) => {
						const localPos = this.flyingCardsContainer.toLocal(
							{ [`x`]: props.xPos, [`y`]: props.yPos },
							this.decks.to,
						)

						return {
							...props,
							xPos: localPos.x,
							yPos: localPos.y,
						}
					},
					start: (props) => {
						const localPos = this.flyingCardsContainer.toLocal(
							{ [`x`]: props.xPos, [`y`]: props.yPos },
							this.decks.from,
						)
						return {
							...props,
							xPos: localPos.x,
							yPos: localPos.y,
						}
					},
				},
			}),
		}
	}

	protected createDecks(cardSizeToTextureMultiplier: number): {
		from: TDeck<TCard>
		to: TDeck<TCard>
	} {
		const cardSize = {
				height: this.cardTexture.height * cardSizeToTextureMultiplier,
				width: this.cardTexture.width * cardSizeToTextureMultiplier,
			},
			skew = genRandomSkew()
		return {
			from: new Deck({
				cardSize,
				cardsSkew: skew,
			}),
			to: new Deck({
				cardSize,
				cardsSkew: skew,
			}),
		}
	}

	protected setFinalPositions<CardLike extends TCard>(
		cards: readonly CardLike[],
	): readonly CardLike[] {
		const incrementFromFullLength = 1
		cards.forEach((card, index) => {
			card.finalPos = this.decks.to.getProperties(
				cards.length - index - incrementFromFullLength,
			)
		})
		return cards
	}

	protected createCards(
		numberCards: number,
		scaleMultiplier: number,
	): Set<TCard> {
		const cards = new Set<TCard>()

		while (cards.size < numberCards) {
			cards.add(new Card(this.cardTexture, scaleMultiplier))
		}
		return cards
	}
}
