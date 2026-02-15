import { gsap } from 'gsap'

export class VisualChanges {
	public readonly life: number
	public readonly startPosition: {
		readonly xPos: number
		readonly yPos: number
	}
	public readonly startScale: number
	public readonly finalPosition: {
		readonly xPos: number
		readonly yPos: number
	}
	public readonly startRotation: number

	public constructor() {
		this.life = VisualChanges.genLife()
		this.startPosition = VisualChanges.genStartPosition()
		this.startScale = VisualChanges.genStartScale()
		this.finalPosition = {
			xPos: this.startPosition.xPos + VisualChanges.genMaxXChange(),
			yPos: this.startPosition.yPos + VisualChanges.genMaxYChange(),
		}
		this.startRotation = VisualChanges.genStartRotation()
	}

	protected static genLife(): number {
		const diffLife = 0.5,
			minLife = 1.5

		return minLife + Math.random() * diffLife
	}

	protected static genStartPosition(): { xPos: number; yPos: number } {
		const maxXPos = 15
		return {
			xPos: ((): number => {
				const absValue = Math.random() * maxXPos,
					chanceOfAbs = 0.5
				if (Math.random() > chanceOfAbs) {
					return -absValue
				}

				return absValue
			})(),
			yPos: 0,
		}
	}

	protected static genStartScale(): number {
		const diffScale = 0.3,
			minScale = 0.5

		return minScale + Math.random() * diffScale
	}

	protected static genMaxYChange(): number {
		const diffPos = -80,
			minPos = -150

		return minPos + Math.random() * diffPos
	}

	protected static genMaxXChange(): number {
		const maxPos = 30

		return ((): number => {
			const absValue = Math.random() * maxPos,
				chanceOfAbs = 0.5
			if (Math.random() > chanceOfAbs) {
				return -absValue
			}

			return absValue
		})()
	}

	protected static genStartRotation(): number {
		const multiplierFor360 = 2
		return Math.random() * Math.PI * multiplierFor360
	}

	public genTimeLine(
		target: {
			readonly scale: object
		},
		onComplete: () => void,
	): gsap.core.Timeline {
		let timeline = gsap.timeline({
			onComplete: () => {
				timeline.kill()
				onComplete()
			},
			paused: true,
		})

		timeline = this.genPositionTimeline(timeline, target)
		timeline = this.genScaleTimeline(timeline, target.scale)
		timeline = this.genRotationTimeline(timeline, target)
		timeline = this.genAlphaTimeline(timeline, target)

		return timeline
	}

	protected genPositionTimeline<TL extends gsap.core.Timeline>(
		timeLine: TL,
		target: object,
	): TL {
		const startTime = 0
		return timeLine
			.fromTo(
				target,
				{
					[`y`]: this.startPosition.yPos,
				},
				{
					duration: this.life,
					ease: 'power2.out',
					[`y`]: this.finalPosition.yPos,
				},
				startTime,
			)
			.fromTo(
				target,
				{
					[`x`]: this.startPosition.xPos,
				},
				{
					duration: this.life,
					ease: 'none',
					[`x`]: this.finalPosition.xPos,
				},
				startTime,
			)
	}

	protected genAlphaTimeline<TL extends gsap.core.Timeline>(
		timeLine: TL,
		target: object,
	): TL {
		const appearTime = ((): number => {
				const percentOfAllLife = 0.2
				return this.life * percentOfAllLife
			})(),
			startTime = 0
		return timeLine
			.fromTo(
				target,
				{
					alpha: 0,
				},
				{
					alpha: 1,
					duration: appearTime,
					ease: 'power1.out',
				},
				startTime,
			)
			.fromTo(
				target,
				{
					alpha: 1,
				},
				{
					alpha: 0,
					duration: this.life - appearTime,
					ease: 'power1.in',
				},
				appearTime,
			)
	}

	protected genRotationTimeline<TL extends gsap.core.Timeline>(
		timeLine: TL,
		target: object,
	): TL {
		const changeRotation = 2,
			startTime = 0

		return timeLine.fromTo(
			target,
			{
				rotation: this.startRotation,
			},
			{
				duration: this.life,
				ease: 'none',
				rotation: this.startRotation + changeRotation,
			},
			startTime,
		)
	}

	protected genScaleTimeline<TL extends gsap.core.Timeline>(
		timeLine: TL,
		target: object,
	): TL {
		const startTime = 0

		return timeLine.fromTo(
			target,
			{
				[`x`]: this.startScale,
				[`y`]: this.startScale,
			},
			{
				duration: this.life,
				ease: 'none',
				[`x`]: '+=0.6',
				[`y`]: '+=0.6',
			},
			startTime,
		)
	}
}
