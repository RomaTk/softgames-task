import { Sprite, type Texture } from 'pixi.js'
import gsap from 'gsap'

export type TClosingProps = {
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

export type TTimeLineGenOptions = {
	readonly duration: number
	readonly props: {
		readonly start: (props: TClosingProps) => TClosingProps
		readonly final: (props: TClosingProps) => TClosingProps
	}
	readonly callBacks: TCallBacks
}

export type TCard = {
	startPos: TClosingProps
	finalPos: TClosingProps
	readonly creatTimeLineForFlyToDeck: (
		options: TTimeLineGenOptions,
	) => gsap.core.Timeline
} & Sprite

export class Card<TextureLike extends Texture> extends Sprite implements TCard {
	public savedStartPos?: TClosingProps
	public savedFinalPos?: TClosingProps

	public constructor(texture: TextureLike, sizeMultiplier: number) {
		super(texture)
		this.scale.set(sizeMultiplier)
	}

	public get startPos(): TClosingProps {
		if (!this.savedStartPos) {
			throw new Error('Start position is not defined')
		}
		return this.savedStartPos
	}

	public set startPos(pos: TClosingProps) {
		this.savedStartPos = pos
		this.position.set(pos.xPos, pos.yPos)
		this.skew.set(pos.skewX, pos.skewY)
		this.rotation = pos.rotation
	}

	public get finalPos(): TClosingProps {
		if (!this.savedFinalPos) {
			throw new Error('Final position is not defined')
		}
		return this.savedFinalPos
	}

	public set finalPos(pos: TClosingProps) {
		this.savedFinalPos = pos
	}

	public override destroy(): void {
		super.destroy()
	}

	public creatTimeLineForFlyToDeck(
		options: TTimeLineGenOptions,
	): gsap.core.Timeline {
		const final = options.props.final(this.finalPos),
			start = options.props.start(this.startPos)

		let timeLine = gsap.timeline({ paused: true })

		timeLine = this.createPosTimelinePart(timeLine, {
			duration: options.duration,
			final,
			start,
			startDelay: 0,
		})
		timeLine = this.createSkewTimelinePart(timeLine, {
			duration: options.duration,
			final,
			start,
			startDelay: 0,
		})
		timeLine.eventCallback('onStart', () => {
			options.callBacks.onStart()
		})
		timeLine.eventCallback('onComplete', () => {
			options.callBacks.onComplete()
		})
		return timeLine
	}

	protected createPosTimelinePart<T extends gsap.core.Timeline>(
		timeline: T,
		options: {
			readonly start: TClosingProps
			readonly final: TClosingProps
			readonly duration: number
			readonly startDelay: number
		},
	): T {
		return timeline.fromTo(
			this.position,
			{
				[`x`]: options.start.xPos,
				[`y`]: options.start.yPos,
			},
			{
				duration: options.duration,
				ease: 'power1.inOut',
				immediateRender: false,
				[`x`]: options.final.xPos,
				[`y`]: options.final.yPos,
			},
			options.startDelay,
		)
	}

	protected createSkewTimelinePart<T extends gsap.core.Timeline>(
		timeline: T,
		options: {
			readonly start: TClosingProps
			readonly final: TClosingProps
			readonly duration: number
			readonly startDelay: number
		},
	): T {
		return timeline
			.fromTo(
				this.skew,
				{
					[`x`]: options.start.skewX,
					[`y`]: options.start.skewY,
				},
				{
					duration: options.duration,
					[`x`]: options.final.skewX,
					[`y`]: options.final.skewY,
				},
				options.startDelay,
			)
			.fromTo(
				this,
				{
					rotation: options.start.rotation,
				},
				{
					duration: options.duration,
					rotation: options.final.rotation,
				},
				options.startDelay,
			)
	}
}
