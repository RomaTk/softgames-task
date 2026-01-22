// Here we have many styles, so mcgic numbers is okay for many places
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Sprite, type Texture } from 'pixi.js'
import { gsap } from 'gsap'

export class LikeFireParticle extends Sprite {
	protected timeline?: gsap.core.Timeline
	protected active: boolean
	protected onComplete: () => void

	public constructor(texture: Texture, onComplete: () => void) {
		super(texture)
		this.anchor.set(0.5)
		this.blendMode = 'add'
		this.active = false
		this.visible = false
		this.onComplete = onComplete
	}

	public get isActive(): boolean {
		return this.active
	}

	public override destroy(): void {
		this.destroyTimeline()
		super.destroy(true)
	}

	// Using GSAP, as it will be more clear what is happening for 10 particles will not have performance issues
	// This function is long but it's ok as it's only one function per particle
	// eslint-disable-next-line max-lines-per-function, max-statements
	public activate(): void {
		this.destroyTimeline()

		this.active = true
		this.visible = true

		const life = 1.5 + Math.random() * 0.5

		this.position.set((Math.random() - 0.5) * 30, 0)
		this.alpha = 0
		this.scale.set(0.5 + Math.random() * 0.3)
		this.rotation = Math.random() * Math.PI * 2

		this.timeline = gsap.timeline({
			onComplete: () => {
				this.destroyTimeline()
				this.active = false
				this.visible = false
				this.onComplete()
			},
			paused: true,
		})
		this.timeline.to(
			this,
			{
				duration: life,
				ease: 'power2.out',
				[`y`]: -150 - Math.random() * 80,
			},
			0,
		)
		this.timeline.to(
			this,
			{
				duration: life,
				ease: 'none',
				[`x`]: this.x + (Math.random() - 0.5) * 60,
			},
			0,
		)
		this.timeline.to(
			this.scale,
			{
				duration: life,
				ease: 'none',
				[`x`]: '+=0.6',
				[`y`]: '+=0.6',
			},
			0,
		)
		this.timeline.to(
			this,
			{
				duration: life,
				ease: 'none',
				rotation: this.rotation + 2,
			},
			0,
		)
		this.timeline.to(
			this,
			{
				alpha: 1,
				duration: life * 0.2,
				ease: 'power1.out',
			},
			0,
		)
		this.timeline.to(
			this,
			{
				alpha: 0,
				duration: life * 0.8,
				ease: 'power1.in',
			},
			life * 0.2,
		)

		this.timeline.play(0)
	}

	protected destroyTimeline(): void {
		this.timeline?.kill()
		delete this.timeline
	}
}
