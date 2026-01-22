/* eslint-disable max-statements */
import { type Application, Container, type Texture, Ticker } from 'pixi.js'
import { createFireTexture } from './create-texture.js'
import { LikeFireParticle } from './one-particle.js'
import { gsap } from 'gsap'

export class PhoenixFlameTask<App extends Application> {
	public readonly viewObject: Container
	protected delayedSpawn?: gsap.core.Tween
	protected readonly spawnTime: number
	protected readonly texture: Texture
	protected readonly textureSize: number
	protected readonly maxParticles: number = 10
	protected readonly particles: Set<LikeFireParticle>

	public constructor(app: App) {
		this.viewObject = new Container()
		this.textureSize = 128
		this.particles = new Set()
		this.maxParticles = 10
		this.texture = createFireTexture(app, this.textureSize)
		this.spawnTime = 0.08
	}

	public resize(width: number, height: number): void {
		this.viewObject.position.set(width / 2, height / 2)
	}

	public display(): void {
		const increment = 1
		for (let index = 0; index < this.maxParticles; index += increment) {
			const particle = new LikeFireParticle(this.texture, () => {
				if (Math.random() < 0.5) {
					particle.activate()
				}
			})
			this.particles.add(particle)
			this.viewObject.addChild(particle)
		}

		this.createDelayedSpawn()
	}

	public destroy(): void {
		this.particles.forEach((particle: { readonly destroy: () => void }) => {
			particle.destroy()
		})
		this.viewObject.destroy(true)
		this.texture.destroy(true)
		this.destroyDelayedSpawn()
	}

	protected destroyDelayedSpawn(): void {
		this.delayedSpawn?.kill()
		delete this.delayedSpawn
	}

	protected createDelayedSpawn(): void {
		this.destroyDelayedSpawn()
		this.delayedSpawn ??= gsap.delayedCall(this.spawnTime, () => {
			if (this.particles.size < this.maxParticles) {
				const particle = new LikeFireParticle(this.texture)
				this.viewObject.addChild(particle)
				this.particles.add(particle)
			} else if (this.particles.size >= this.maxParticles) {
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
			}
			this.createDelayedSpawn()
		})
	}
}
