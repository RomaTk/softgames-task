/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import { Texture, Sprite } from 'pixi.js'
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
	public activate(): void {
		this.destroyTimeline()

		this.active = true
		this.visible = true

		// Initial State
		const life = 1.5 + Math.random() * 0.5 // Duration in seconds

		this.x = (Math.random() - 0.5) * 30
		this.y = 0
		this.alpha = 0
		this.scale.set(0.5 + Math.random() * 0.3)
		this.rotation = Math.random() * Math.PI * 2

		// Create GSAP Timeline
		this.timeline = gsap.timeline({
			onComplete: () => {
				this.destroyTimeline()
				this.active = false
				this.visible = false
				this.onComplete()
			},
			paused: true,
		})

		// 1. Move Up (Decelerating to simulate physics/drag)
		this.timeline.to(
			this,
			{
				y: -150 - Math.random() * 80, // Target Y
				duration: life,
				ease: 'power2.out', // Start fast, slow down at top
			},
			0,
		)

		// 2. Drift Horizontally (Linear)
		this.timeline.to(
			this,
			{
				x: this.x + (Math.random() - 0.5) * 60,
				duration: life,
				ease: 'none',
			},
			0,
		)

		// 3. Grow (Linear)
		this.timeline.to(
			this.scale,
			{
				x: '+=0.6', // Grow by 0.6
				y: '+=0.6',
				duration: life,
				ease: 'none',
			},
			0,
		)

		// 4. Rotate
		this.timeline.to(
			this,
			{
				rotation: this.rotation + 2,
				duration: life,
				ease: 'none',
			},
			0,
		)

		// 5. Fade In
		this.timeline.to(
			this,
			{
				alpha: 1,
				duration: life * 0.2,
				ease: 'power1.out',
			},
			0,
		)

		// 6. Fade Out
		this.timeline.to(
			this,
			{
				alpha: 0,
				duration: life * 0.8,
				ease: 'power1.in',
			},
			life * 0.2,
		) // Start after fade in finishes

		this.timeline.play(0)
	}

	protected destroyTimeline(): void {
		this.timeline?.kill()
		delete this.timeline
	}
}
