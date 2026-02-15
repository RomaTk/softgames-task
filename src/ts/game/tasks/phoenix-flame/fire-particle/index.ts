import { Sprite, type Texture } from 'pixi.js'
import { VisualChanges } from './visual-changes.js'

export class FireParticle<T extends Texture> extends Sprite {
	protected timeline?: ReturnType<VisualChanges['genTimeLine']>
	protected active: boolean
	protected onComplete: () => void

	public constructor(texture: T, onComplete: () => void) {
		super(texture)
		this.onComplete = onComplete
		this.active = false
		this.init()
	}

	public get isActive(): boolean {
		return this.active
	}

	public override destroy(): void {
		this.destroyTimeline()
		super.destroy(true)
	}

	public activate(): void {
		if (this.destroyed) {
			throw new Error('Not possible to activate destroyed particle')
		}
		this.destroyTimeline()

		const startTime = 0
		this.timeline = new VisualChanges().genTimeLine(this, () => {
			this.active = false
			this.visible = false
			this.destroyTimeline()
			this.onComplete()
		})
		this.timeline.add(() => {
			this.active = true
			this.visible = true
		}, startTime)
		this.timeline.play(startTime)
	}

	protected init(): void {
		const centerAnchor = 0.5
		this.anchor.set(centerAnchor)
		this.blendMode = 'add'
		this.visible = false
	}

	protected destroyTimeline(): void {
		this.timeline?.kill()
		delete this.timeline
	}
}
