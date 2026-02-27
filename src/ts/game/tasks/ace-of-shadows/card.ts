import { Sprite, type Texture } from 'pixi.js'
import gsap from 'gsap'

export type TClosingPosition = {
	readonly xPos: number
	readonly yPos: number
	readonly skewX: number
	readonly skewY: number
	readonly rotation: number
}

export type TCallBacks = {
	readonly onStart: () => void
	readonly onComplete: () => void
}

export type TCard = {
	readonly creatTimeLineForFlyToDeck: (
		duration: number,
		callBacks: TCallBacks,
	) => gsap.core.Timeline
} & Sprite

export class Card<TextureLike extends Texture> extends Sprite implements TCard {
	public isInDeck: boolean
	public startPos?: TClosingPosition
	public finalPos?: TClosingPosition

	public constructor(texture: TextureLike) {
		super(texture)
		this.isInDeck = false
	}

	public creatTimeLineForFlyToDeck(
		duration: number,
		callBacks: TCallBacks,
	): gsap.core.Timeline {
		if (!this.startPos) {
			throw new Error('Start position is not defined')
		}
		if (!this.finalPos) {
			throw new Error('Final position is not defined')
		}
		const timeLine = gsap.timeline({ paused: true })
		timeLine.fromTo(
			this,
			{
				pixi: {
					rotation: this.startPos.rotation,
					skewX: this.startPos.skewX,
					skewY: this.startPos.skewY,
					[`x`]: this.startPos.xPos,
					[`y`]: this.startPos.yPos,
				},
			},
			{
				duration,
				onComplete: () => {
					callBacks.onComplete()
				},
				onStart: () => {
					callBacks.onStart()
				},

				pixi: {
					rotation: this.finalPos.rotation,
					skewX: this.finalPos.skewX,
					skewY: this.finalPos.skewY,
					[`x`]: this.finalPos.xPos,
					[`y`]: this.finalPos.yPos,
				},
			},
		)
		return timeLine
	}
}
