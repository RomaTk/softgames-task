/* eslint-disable max-statements */
/* eslint-disable one-var */
/* eslint-disable sort-keys */
/* eslint-disable max-lines-per-function */
import { type Application, Container, Sprite, Texture } from 'pixi.js'
import { Deck } from './deck.js'
import { createCardBack } from './create-skin.js'
import { gsap } from 'gsap'
import { th } from 'zod/v4/locales'

export class AceOfShadowsTask<App extends Application> {
	public readonly viewObject: Container
	protected decks: {
		readonly from: Deck
		readonly to: Deck
	}
	protected animationTimeline?: gsap.core.Timeline
	protected readonly flyingCardsContainer: Container
	protected readonly cardTexture: Texture
	protected readonly numberCards: number
	protected readonly cardTimeLines: Set<gsap.core.Timeline>
	protected readonly viewObjectMaxSize: {
		readonly width: number
		readonly height: number
	}

	public constructor(application: App) {
		this.viewObject = new Container()
		this.flyingCardsContainer = new Container()
		this.numberCards = 144

		const skew = {
			x: Math.random() * 0.05,
			y: Math.random() * 0.05,
		}
		const viewObjectMaxSize = {
			width: 1500,
			height: 900,
		}
		this.viewObjectMaxSize = viewObjectMaxSize
		this.decks = {
			from: new Deck(skew),
			to: new Deck(skew),
		}
		this.cardTimeLines = new Set<gsap.core.Timeline>()
		this.cardTexture = createCardBack(application)
		this.createCards()
	}

	public createCards(): void {
		const increment = 1
		for (let index = 0; index < this.numberCards; index += increment) {
			const card = new Sprite(this.cardTexture)
			this.decks.from.addCard(card, true)
		}
	}

	public resize(width: number, height: number): void {
		this.viewObject.position.set(width / 2, height / 2)

		let realSizes = {
			width,
			height,
		}

		if (width < height) {
			this.viewObject.rotation = Math.PI / 2
			realSizes = {
				width: realSizes.height,
				height: realSizes.width,
			}
		} else {
			this.viewObject.rotation = 0
		}

		this.viewObject.scale.set(
			Math.min(
				realSizes.width / this.viewObjectMaxSize.width,
				realSizes.height / this.viewObjectMaxSize.height,
				1,
			),
		)
	}

	public display(): void {
		this.viewObject.addChild(this.decks.from)
		this.viewObject.addChild(this.decks.to)
		this.decks.from.x = -400
		this.decks.to.x = 400
		const oneCardIncrement = 1,
			beginning = 0
		for (
			let index = 0;
			index < this.numberCards;
			index += oneCardIncrement
		) {
			this.addOneCardToAnimation(index)
		}
		this.viewObject.addChild(this.flyingCardsContainer)
		this.animationTimeline?.eventCallback('onComplete', () => {
			this.decks = {
				from: this.decks.to,
				to: this.decks.from,
			}
			this.animationTimeline
				?.play(beginning)
				.reverse(this.animationTimeline.duration())
		})
		this.animationTimeline?.eventCallback('onReverseComplete', () => {
			this.decks = {
				from: this.decks.to,
				to: this.decks.from,
			}
			this.animationTimeline?.play(beginning)
		})
		this.animationTimeline?.play(beginning)
	}

	public destroy(): void {
		this.animationTimeline?.kill()
		delete this.animationTimeline
		this.cardTimeLines.forEach((tl: { readonly kill: () => void }) => {
			tl.kill()
		})
		this.cardTimeLines.clear()
		this.decks.from.destroy(true)
		this.decks.to.destroy(true)
		this.viewObject.destroy(true)
		this.cardTexture.destroy(true)
	}

	protected async playAnimation(): Promise<void> {
		const beginning = 0
		this.animationTimeline?.reversed(false)
		await this.animationTimeline?.play(beginning)
		this.decks = {
			from: this.decks.to,
			to: this.decks.from,
		}
		await this.animationTimeline
			?.play(beginning)
			.reverse(this.animationTimeline.duration())
		this.decks = {
			from: this.decks.to,
			to: this.decks.from,
		}
	}

	protected addOneCardToAnimation(index: number): void {
		const card = this.decks.from.getCardByIndex(index)
		const startPosition = {
			x: card.x + this.decks.from.x,
			y: card.y + this.decks.from.y,
		}
		const startSkew = {
			x: card.skew.x,
			y: card.skew.y,
		}
		const prop = this.decks.to.getPropertiesForTopCard(card, index)
		prop.position.x += this.decks.to.x
		prop.position.y += this.decks.to.y
		const posion = {
			x: startPosition.x,
			y: startPosition.y,
		}
		const duration = 2
		const cardTimeline = gsap
			.timeline()
			.add(() => {
				const globalTimeLine = this.animationTimeline
				if (!globalTimeLine) {
					throw new Error('No animation tween')
				}
				if (!globalTimeLine.reversed()) {
					const deAttachedCard = this.decks.from.getTopCard()
					this.flyingCardsContainer.addChildAt(deAttachedCard, 0)
					// To make sure to change position in the same render frame
					deAttachedCard.position.set(
						startPosition.x,
						startPosition.y,
					)
					return
				}
				this.decks.to.addCard(card, false)
			}, 0)
			.add(() => {
				const globalTimeLine = this.animationTimeline
				if (!globalTimeLine) {
					throw new Error('No animation tween')
				}
				if (!globalTimeLine.reversed()) {
					this.decks.to.addCard(card, false)
					return
				}
				console.log('Reversing animation')
				const deAttachedCard = this.decks.from.getTopCard()
				this.flyingCardsContainer.addChildAt(deAttachedCard, 0)
				// To make sure to change position in the same render frame
				deAttachedCard.position.set(prop.position.x, prop.position.y)
			}, duration)

			.fromTo(
				posion,
				{
					x: startPosition.x,
					y: startPosition.y,
				},
				{
					x: prop.position.x,
					y: prop.position.y,
					duration,
					onUpdate: () => {
						if (card.parent === this.flyingCardsContainer) {
							card.position.set(posion.x, posion.y)
						}
					},
					ease: 'power2.inOut',
				},
				0,
			)
			.fromTo(
				card.skew,
				{ x: card.skew.x, y: card.skew.y },
				{
					x: prop.skew.x,
					y: prop.skew.y,
					duration,
					onUpdate: () => {
						if (card.parent === this.flyingCardsContainer) {
							// First half: overshoot in positive direction, second half: overshoot in negative direction
							const t = cardTimeline.progress()
							// Peaks depend on card index: lower index = bigger first peak, smaller second
							const maxPeak1 = 2.5,
								minPeak1 = 0.5
							const maxPeak2 = 0.01,
								minPeak2 = 0.3
							const norm = Math.max(1, this.numberCards - 1)
							const idxNorm = 1 - index / norm
							const peak1 =
								minPeak1 + (maxPeak1 - minPeak1) * idxNorm
							const peak2 =
								minPeak2 + (maxPeak2 - minPeak2) * idxNorm
							let skewX, skewY
							if (t < 0.5) {
								// First half: positive overshoot
								const t1 = t / 0.5
								const arc = -4 * Math.pow(t1 - 0.5, 2) + 1
								const midSkewX =
									startSkew.x +
									(prop.skew.x - startSkew.x) * (1 + peak1)
								const midSkewY =
									startSkew.y +
									(prop.skew.y - startSkew.y) * (1 + peak1)
								skewX =
									startSkew.x * (1 - t1) +
									midSkewX *
										arc *
										(1 - Math.abs(2 * t1 - 1)) +
									prop.skew.x * t1
								skewY =
									startSkew.y * (1 - t1) +
									midSkewY *
										arc *
										(1 - Math.abs(2 * t1 - 1)) +
									prop.skew.y * t1
							} else {
								// Second half: much smaller, gentler negative overshoot
								const t2 = (t - 0.5) / 0.5
								// Use a much flatter, less pronounced arc
								const arc =
									0.2 * (1 - Math.pow(t2 - 0.5, 2) * 4)
								const midSkewX =
									startSkew.x -
									(prop.skew.x - startSkew.x) * (1 + peak2)
								const midSkewY =
									startSkew.y -
									(prop.skew.y - startSkew.y) * (1 + peak2)
								skewX =
									prop.skew.x * (1 - t2) +
									midSkewX *
										arc *
										(1 - Math.abs(2 * t2 - 1)) +
									prop.skew.x * t2
								skewY =
									prop.skew.y * (1 - t2) +
									midSkewY *
										arc *
										(1 - Math.abs(2 * t2 - 1)) +
									prop.skew.y * t2
							}
							card.skew.set(skewX, skewY)
						}
					},
				},
				0,
			)
			.fromTo(
				card,
				{ rotation: card.rotation },
				{
					rotation: prop.rotation,
					duration: duration,
				},
				0,
			)
		this.cardTimeLines.add(cardTimeline)
		this.animationTimeline ??= new gsap.core.Timeline({ paused: true })
		this.animationTimeline.add(cardTimeline, index)
	}
}
