import { Graphics, Texture } from 'pixi.js'
import {
	LayoutContainer,
	LayoutHTMLText,
	LayoutSprite,
	LayoutText,
} from '@pixi/layout/components'
import type { Data as DataFromEndpoint } from '../data.js'
import { ErrorCatcher } from '../../../error-catcher.js'
import gsap from 'gsap'

export type TMessageOptions = {
	readonly author: {
		readonly name: string
		readonly avatarUrl: string
	}
	readonly text: string
	readonly position: 'left' | 'right'
}

export type SizeGetter = {
	readonly width: number
	readonly height: number
	readonly destroy: (all: boolean) => void
}

export class Message<Data extends DataFromEndpoint = DataFromEndpoint> {
	public readonly viewObject: LayoutContainer
	protected resizeDelayedCall?: gsap.core.Tween
	protected readonly options: TMessageOptions
	protected readonly authorName: LayoutText
	protected readonly messageContainer: LayoutContainer
	protected readonly messageText: LayoutHTMLText
	protected readonly authorAvatar: LayoutSprite
	// HACK to cover the sharp corner of the message container
	protected readonly cornerRect: Graphics
	protected readonly htmlTextWithEmojies: string
	protected readonly data: Data
	protected readonly sizeGetters: {
		readonly message: SizeGetter
		readonly authorName: SizeGetter
	}

	// Ok for constructor
	// eslint-disable-next-line max-statements
	public constructor(options: TMessageOptions, data: Data) {
		this.options = options
		this.data = data

		this.htmlTextWithEmojies = this.generateTextWithEmojies(
			this.options.text,
		)
		this.viewObject = this.generateViewObject()
		this.cornerRect = this.generateCornerRect()
		this.authorName = this.generateAuthorName()
		this.authorAvatar = this.generateAvatar()
		this.messageText = this.generateMessageText(true)
		this.messageContainer = this.generateMessageContainer()
		this.sizeGetters = {
			authorName: this.generateAuthorName(),
			message: this.generateMessageText(false),
		}

		this.display().catch((err: unknown) => {
			ErrorCatcher.instance.throw(err, false)
		})
	}

	// Async as we need to update layout update
	public async display(): Promise<void> {
		this.messageContainer.addChild(this.authorName, this.messageText)
		this.viewObject.addChild(this.authorAvatar)
		this.viewObject.addChild(this.messageContainer)
		this.authorName.layout = {
			height: this.authorName.height,
			maxWidth: this.authorName.width,
		}
		this.textLayoutFix()
		await this.resizeDelayedCall
	}

	public resize(): void {
		this.textLayoutFix()
	}

	public destroy(): void {
		this.cornerRect.destroy(true)
		this.authorName.destroy(true)
		this.authorAvatar.destroy()
		this.messageText.destroy(true)
		this.messageContainer.destroy(true)
		this.viewObject.destroy(true)
		this.destroySizeGetters()
		this.destroyResizeDelayedCall()
	}

	protected destroySizeGetters(): void {
		this.sizeGetters.authorName.destroy(true)
		this.sizeGetters.message.destroy(true)
	}

	protected destroyResizeDelayedCall(): void {
		this.resizeDelayedCall?.kill()
		delete this.resizeDelayedCall
	}

	protected textLayoutFix(): void {
		// POSSIBLE_BUG layout update specific issue (need to investigate more) related to wordWrap
		const delayBiggerThanThrottle = 0.5
		this.resizeDelayedCall ??= gsap.delayedCall(
			delayBiggerThanThrottle,
			(): void => {
				if (!this.resizeDelayedCall) {
					return
				}
				this.destroyResizeDelayedCall()
				const paddinngMargin = 30,
					saveHeight = 20
				// Full size
				if (
					this.sizeGetters.message.width + paddinngMargin <
					this.messageContainer.width
				) {
					this.messageText.layout = {
						height:
							this.sizeGetters.message.height +
							saveHeight +
							this.sizeGetters.authorName.height,
						maxWidth: '100%',
						width: this.sizeGetters.message.width + paddinngMargin,
					}
				} else {
					this.messageText.layout = {
						height:
							((this.sizeGetters.message.width + paddinngMargin) /
								this.messageContainer.width) *
								this.sizeGetters.message.height +
							saveHeight +
							this.sizeGetters.authorName.height,
						width: '100%',
					}
				}
			},
		)
	}

	protected generateMessageText(isWordWrap: boolean): LayoutHTMLText {
		const messageText = new LayoutHTMLText({
			style: {
				fill: '#3495eb',
				fontFamily: 'Arial',
				fontSize: 22,
				fontWeight: 'bold',
				padding: 6,
				stroke: '#1a4e7a',
				wordWrap: isWordWrap,
			},
			text: this.htmlTextWithEmojies,
		})
		return messageText
	}

	protected generateAvatar(): LayoutSprite {
		const avatar = new LayoutSprite({
			texture: ((): Texture => {
				if (this.options.author.avatarUrl) {
					return Texture.from(this.options.author.avatarUrl)
				}
				return Texture.WHITE
			})(),
		})
		avatar.layout = {
			alignSelf: 'flex-end',
			aspectRatio: 1,
			maxHeight: '50%',
			objectFit: 'cover',
			width: 100,
		}
		return avatar
	}

	protected generateAuthorName(): LayoutText {
		const authorName = new LayoutText({
			style: {
				fill: '#ffb300',
				fontFamily: 'Arial',
				fontSize: 26,
				fontWeight: 'bold',
				stroke: '#a67c00',
			},
			text: this.options.author.name,
		})
		return authorName
	}

	protected generateViewObject(): LayoutContainer {
		return new LayoutContainer({
			layout: {
				alignSelf: ((): 'flex-start' | 'flex-end' => {
					if (this.options.position === 'left') {
						return 'flex-start'
					}
					return 'flex-end'
				})(),
				display: 'flex',
				flexDirection: ((): 'row' | 'row-reverse' => {
					if (this.options.position === 'left') {
						return 'row'
					}
					return 'row-reverse'
				})(),
				flexShrink: 0,
				marginTop: 10,
				width: '75%',
			},
		})
	}

	protected generateMessageContainer(): LayoutContainer {
		const layoutContainer = new LayoutContainer({
			layout: {
				alignItems: 'flex-start',
				backgroundColor: 0x4a148c,
				borderRadius: 10,
				display: 'flex',
				flexDirection: 'column',
				gap: 5,
				marginBottom: 10,
				maxWidth: '100%',
				objectFit: 'fill',
				padding: 10,
			},
		})

		layoutContainer.addChild(this.cornerRect)

		return layoutContainer
	}

	protected generateCornerRect(): Graphics {
		const cornerRect = new Graphics()
			// No sense to create variables for them
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			.roundRect(0, 0, 20, 20, 0)
			// No sense to create variables for them
			// eslint-disable-next-line @typescript-eslint/no-magic-numbers
			.fill(0x4a148c)
		cornerRect.layout = {
			position: 'absolute',
			...((): { right?: number; left?: number } => {
				if (this.options.position === 'left') {
					return { left: 0 }
				}
				return { right: 0 }
			})(),
			bottom: 0,
			height: '50%',
			objectFit: 'fill',
			width: '50%',
		}
		return cornerRect
	}

	protected generateTextWithEmojies(text: string): string {
		const regex = /\{(?<emojie>[^}]+)\}/gu
		let changedText = text
		text.matchAll(regex).forEach(
			(match: {
				readonly groups?: { readonly emojie?: string }
			}): void => {
				const emojie = match.groups?.emojie
				if (typeof emojie !== 'undefined') {
					changedText = changedText.replaceAll(
						`{${emojie}}`,
						`<img src="${
							this.data.emojies.find(
								(element: { readonly name: string }) =>
									element.name === emojie,
							)?.base64 ??
							((): string => {
								try {
									throw Error(
										`Emoji with name "${emojie}" not found`,
									)
								} catch (err) {
									ErrorCatcher.instance.throw(err, true)
								}

								return ''
							})()
						}" width="24" height="24" style="vertical-align: middle" />`,
					)
				}
			},
		)
		return changedText
	}
}
