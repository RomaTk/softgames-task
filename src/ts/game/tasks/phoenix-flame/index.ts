import { type Application, Container, type Texture } from 'pixi.js'
import { FireParticle } from './fire-particle/index.js'
import { createFireTexture } from './create-texture.js'
import { gsap } from 'gsap'

export class PhoenixFlameTask<App extends Application> {
	public readonly viewObject: Container
	protected delayedSpawn?: gsap.core.Tween
	protected readonly spawnTime: number
	protected readonly texture: Texture
	protected readonly textureSize: number
	protected readonly maxParticles: number
	protected readonly particles: Set<
		FireParticle<ReturnType<typeof createFireTexture>>
	>

	public constructor(app: App) {
		this.viewObject = new Container()
		this.textureSize = 128
		this.particles = new Set()
		this.maxParticles = 10
		this.texture = createFireTexture(() => app, this.textureSize)
		this.spawnTime = 0.08
		this.init()
	}

	public resize(width: number, height: number): void {
		if (this.viewObject.destroyed) {
			throw new Error(
				'Object is destroyed, so resize can not be executed',
			)
		}

		const centerFactor = 0.5,
			maxHeight = 600,
			maxWidthHeight = 200,
			standardScale = 1

		this.viewObject.position.set(
			width * centerFactor,
			height * centerFactor,
		)

		this.viewObject.scale.set(
			Math.min(width / maxWidthHeight, height / maxHeight, standardScale),
		)
	}

	public destroy(): void {
		if (this.viewObject.destroyed) {
			return
		}
		this.particles.forEach((particle: { readonly destroy: () => void }) => {
			particle.destroy()
		})
		this.viewObject.destroy()
		this.texture.destroy(true)
		this.destroyDelayedSpawn()
	}

	protected init(): void {
		const increment = 1
		for (let index = 0; index < this.maxParticles; index += increment) {
			const particle = new FireParticle(this.texture, () => {
				const chance = 0.7
				if (Math.random() < chance) {
					particle.activate()
				}
			})
			this.particles.add(particle)
			this.viewObject.addChild(particle)
		}

		this.createDelayedSpawn()
	}

	protected destroyDelayedSpawn(): void {
		this.delayedSpawn?.kill()
		delete this.delayedSpawn
	}

	protected createDelayedSpawn(): void {
		this.destroyDelayedSpawn()
		this.delayedSpawn = gsap.delayedCall(this.spawnTime, () => {
			if (this.viewObject.destroyed) {
				return
			}
			const deadParticle = this.particles
				.values()
				.find(
					(particle: { readonly isActive: boolean }) =>
						!particle.isActive,
				)
			if (deadParticle) {
				deadParticle.activate()
				this.viewObject.addChild(deadParticle)
			}
			this.createDelayedSpawn()
		})
	}
}
