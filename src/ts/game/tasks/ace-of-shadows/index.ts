// No need to separate class, it is not big enough
/* eslint-disable max-lines */

import { type Application, Container, Sprite, type Texture } from 'pixi.js'
import { Deck, type TPropertiesForTopCard } from './deck.js'
import { createCardBack } from './create-skin.js'
import { gsap } from 'gsap'
import { skewRecalculation } from './skew-recalculation/index.js'

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
	// In seconds
	protected readonly forOneCardAnimationDuration: number
	protected readonly delayBetweenCardsAnimationDuration: number

	// Here many assignments in constructor, but it is ok
	// eslint-disable-next-line max-statements
	public constructor(application: App) {
		this.viewObject = new Container()
		this.flyingCardsContainer = new Container()
		this.numberCards = 144
		this.forOneCardAnimationDuration = 2
		this.delayBetweenCardsAnimationDuration = 1

		this.viewObjectMaxSize = {
			height: 900,
			width: 1500,
		}
		const skew = AceOfShadowsTask.getSkew()
		this.decks = {
			from: new Deck(skew),
			to: new Deck(skew),
		}
		this.cardTimeLines = new Set<gsap.core.Timeline>()
		this.cardTexture = createCardBack(application)
		this.createCards()
	}

	protected static getSkew(): { readonly x: number; readonly y: number } {
		const factor = 0.05
		return {
			[`x`]: Math.random() * factor,
			[`y`]: Math.random() * factor,
		}
	}

	public createCards(): void {
		const increment = 1
		for (let index = 0; index < this.numberCards; index += increment) {
			const card = new Sprite(this.cardTexture)
			this.decks.from.addCard(card, true)
		}
	}

	public resize(width: number, height: number): void {
		const halfFactor = 0.5
		this.viewObject.position.set(width * halfFactor, height * halfFactor)

		let realSizes = {
			height,
			width,
		}

		if (width < height) {
			this.viewObject.angle = 90
			realSizes = {
				height: realSizes.width,
				width: realSizes.height,
			}
		} else {
			this.viewObject.angle = 0
		}

		this.viewObject.scale.set(
			Math.min(
				realSizes.width / this.viewObjectMaxSize.width,
				realSizes.height / this.viewObjectMaxSize.height,
			),
		)
	}

	public display(): void {
		this.viewObject.addChild(this.decks.from)
		this.viewObject.addChild(this.decks.to)

		this.updateDecksPositions()

		const oneCardIncrement = 1

		for (
			let index = 0;
			index < this.numberCards;
			index += oneCardIncrement
		) {
			this.addOneCardToAnimation(index)
		}
		this.viewObject.addChild(this.flyingCardsContainer)

		this.displayAnimation()
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

	protected displayAnimation(): void {
		const startTime = 0
		this.animationTimeline?.eventCallback('onComplete', () => {
			this.decks = {
				from: this.decks.to,
				to: this.decks.from,
			}
			this.animationTimeline
				?.play(startTime)
				.reverse(this.animationTimeline.duration())
		})
		this.animationTimeline?.eventCallback('onReverseComplete', () => {
			this.decks = {
				from: this.decks.to,
				to: this.decks.from,
			}
			this.animationTimeline?.play(startTime)
		})
		this.animationTimeline?.play(startTime)
	}

	protected updateDecksPositions(): void {
		const center = 0,
			spreadFromCenter = 400

		this.decks.from.position.set(-spreadFromCenter, center)
		this.decks.to.position.set(spreadFromCenter, center)
	}

	protected addOneCardToAnimation(index: number): void {
		const cardTimeline = ((card: Sprite): gsap.core.Timeline =>
			this.generateCardTimeline({
				card,
				finalVisualData: ((): TPropertiesForTopCard => {
					const finalVisualData = {
						...this.decks.to.getPropertiesForTopCard(card, index),
					}
					finalVisualData.position = {
						[`x`]: finalVisualData.position.x + this.decks.to.x,
						[`y`]: finalVisualData.position.y + this.decks.to.y,
					}
					return finalVisualData
				})(),
				index,
				startPosition: {
					[`x`]: card.x + this.decks.from.x,
					[`y`]: card.y + this.decks.from.y,
				},
			}))(this.decks.from.getCardByIndex(index))

		this.cardTimeLines.add(cardTimeline)
		this.animationTimeline ??= new gsap.core.Timeline({ paused: true })
		this.animationTimeline.add(
			cardTimeline,
			index * this.delayBetweenCardsAnimationDuration,
		)
	}

	protected generateCardTimeline(prop: {
		readonly index: number
		readonly startPosition: { readonly x: number; readonly y: number }
		readonly card: Sprite
		readonly finalVisualData: {
			readonly position: { readonly x: number; readonly y: number }
			readonly skew: { readonly x: number; readonly y: number }
			readonly rotation: number
		}
	}): gsap.core.Timeline {
		return this.addVisualFromToTimeline(
			this.addLogicalCallsToTimeline(gsap.timeline(), {
				card: prop.card,
				duration: this.forOneCardAnimationDuration,
				finalPosition: prop.finalVisualData.position,
				startPosition: prop.startPosition,
			}),
			{
				card: prop.card,
				duration: this.forOneCardAnimationDuration,
				finalPosition: prop.finalVisualData.position,
				finalRotation: prop.finalVisualData.rotation,
				finalSkew: prop.finalVisualData.skew,
				index: prop.index,
				startPosition: prop.startPosition,
			},
		)
	}

	protected addLogicalCallsToTimeline<TimeLine extends gsap.core.Timeline>(
		timeline: TimeLine,
		props: {
			readonly startPosition: { readonly x: number; readonly y: number }
			readonly card: Sprite
			readonly duration: number
			readonly finalPosition: { readonly x: number; readonly y: number }
		},
	): TimeLine {
		const noDelayOnStart = 0
		return timeline
			.add(() => {
				const globalTimeLine = this.animationTimeline
				if (!globalTimeLine) {
					throw new Error('No animation tween')
				}
				if (!globalTimeLine.reversed()) {
					const asFirstChild = 0,
						deAttachedCard = this.decks.from.getTopCard()

					this.flyingCardsContainer.addChildAt(
						deAttachedCard,
						asFirstChild,
					)
					// To make sure to change position in the same render frame
					deAttachedCard.position = { ...props.startPosition }
					return
				}
				this.decks.to.addCard(props.card, false)
			}, noDelayOnStart)
			.add(() => {
				const asFirstChild = 0,
					globalTimeLine = this.animationTimeline

				if (!globalTimeLine) {
					throw new Error('No animation tween')
				}
				if (!globalTimeLine.reversed()) {
					this.decks.to.addCard(props.card, false)
					return
				}

				this.decks.from.getTopCard()
				this.flyingCardsContainer.addChildAt(props.card, asFirstChild)
				// To make sure to change position in the same render frame
				props.card.position = {
					...props.finalPosition,
				}
			}, props.duration)
	}

	// If this function is bigger then others - it is okay, we setting here properties, often - separately
	// eslint-disable-next-line max-lines-per-function
	protected addVisualFromToTimeline<TimeLine extends gsap.core.Timeline>(
		timeline: TimeLine,
		props: {
			readonly startPosition: { readonly x: number; readonly y: number }
			readonly finalPosition: { readonly x: number; readonly y: number }
			readonly finalSkew: { readonly x: number; readonly y: number }
			readonly finalRotation: number
			readonly duration: number
			readonly card: Sprite
			readonly index: number
		},
	): TimeLine {
		const noDelayOnStart = 0,
			position = {
				...props.startPosition,
			},
			startSkew = {
				[`x`]: props.card.skew.x,
				[`y`]: props.card.skew.y,
			}
		return timeline
			.fromTo(
				position,
				{
					...props.startPosition,
				},
				{
					...props.finalPosition,
					duration: props.duration,
					ease: 'power2.inOut',
					onUpdate: () => {
						if (props.card.parent === this.flyingCardsContainer) {
							props.card.position.set(position.x, position.y)

							// POSSIBLE_BUG - I do not change final and start skew as they same in this example
							const { skewX, skewY } = skewRecalculation({
								cardsInfo: {
									currentIndex: ((): number => {
										if (
											this.animationTimeline?.reversed() ===
											true
										) {
											const reduceToLastIndex = 1
											return (
												this.numberCards -
												reduceToLastIndex -
												props.index
											)
										}
										return props.index
									})(),
									totalCount: this.numberCards,
								},
								finalSkew: props.finalSkew,
								progress: ((): number => {
									if (
										this.animationTimeline?.reversed() ===
										true
									) {
										const maxProgress = 1
										return maxProgress - timeline.progress()
									}
									return timeline.progress()
								})(),
								startSkew,
							})

							if (this.animationTimeline?.reversed() === true) {
								props.card.scale.set(-1)
								props.card.anchor.set(1)
							} else {
								props.card.scale.set(1)
								props.card.anchor.set(0)
							}
							props.card.skew.set(skewX, skewY)
						}
					},
				},
				noDelayOnStart,
			)
			.fromTo(
				props.card,
				{ rotation: props.card.rotation },
				{
					duration: props.duration,
					rotation: props.finalRotation,
				},
				noDelayOnStart,
			)
	}
}
