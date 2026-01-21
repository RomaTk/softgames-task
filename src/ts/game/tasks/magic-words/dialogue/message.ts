/* eslint-disable max-statements */
import {
	LayoutContainer,
	LayoutHTMLText,
	LayoutSprite,
	LayoutText,
} from '@pixi/layout/components'
import { text } from 'node:stream/consumers'
import {
	EventEmitter,
	Graphics,
	HTMLText,
	Texture,
	HTMLTextStyle,
	Ticker,
} from 'pixi.js'
import gsap from 'gsap'

export type TMessageOptions = {
	readonly author: {
		readonly name: string
		readonly avatarUrl: string
	}
	readonly text: string
	readonly position: 'left' | 'right'
}

export class Message {
	public readonly viewObject: LayoutContainer
	protected readonly options: TMessageOptions
	protected readonly authorName: LayoutText
	protected readonly messageContainer: LayoutContainer
	protected readonly messageText: LayoutHTMLText
	protected readonly authorAvatar: LayoutSprite
	// HACK to cover the sharp corner of the message container
	protected readonly cornerRect: Graphics

	public constructor(options: TMessageOptions) {
		this.options = options

		this.viewObject = this.generateViewObject()
		this.cornerRect = this.generateCornerRect()
		this.authorName = this.generateAuthorName()
		this.authorAvatar = this.generateAvatar()
		this.messageText = this.generateMessageText(true)
		this.messageContainer = this.generateMessageContainer()

		this.display()
	}

	// It is public but for this class no sense to be used outside
	public display(): void {
		this.messageContainer.addChild(this.messageText)
		this.viewObject.addChild(this.authorAvatar)
		this.viewObject.addChild(this.messageContainer)

		this.textLayoutFix()
	}

	public resize(): void {
		this.textLayoutFix()
	}

	public destroy(): void {
		this.cornerRect.destroy(true)
		this.authorName.destroy(true)
		this.authorAvatar.destroy(true)
		this.messageText.destroy(true)
		this.messageContainer.destroy(true)
		this.viewObject.destroy(true)
	}

	protected textLayoutFix(): void {
		// POSSIBLE_BUG layout update specific issue (need to investigate more)
		gsap.delayedCall(0.5, (): void => {
			const findOutMinSizeMessageText = this.generateMessageText(false)

			// Full size
			if (
				findOutMinSizeMessageText.width + 30 <
				this.messageContainer.width
			) {
				this.messageText.layout = {
					width: findOutMinSizeMessageText.width,
					maxWidth: '100%',
					height: findOutMinSizeMessageText.height + 40,
				}
			} else {
				this.messageText.layout = {
					width: '100%',
					height:
						((findOutMinSizeMessageText.width + 30) /
							this.messageContainer.width) *
							findOutMinSizeMessageText.height +
						20,
				}
			}

			findOutMinSizeMessageText.destroy(true)
		})
	}

	protected generateMessageText(isWordWrap: boolean): LayoutHTMLText {
		const messageText = new LayoutHTMLText({
			style: {
				fill: 0xff1010,
				wordWrap: isWordWrap,
				fontSize: 20,
			},
			text: this.options.text,
		})

		return messageText
	}

	protected generateAvatar(): LayoutSprite {
		const avatar = new LayoutSprite({
			texture: this.options.author.avatarUrl
				? Texture.from(this.options.author.avatarUrl)
				: Texture.WHITE,
		})
		avatar.layout = {
			width: 100,
			maxHeight: '50%',
			aspectRatio: 1,
			objectFit: 'cover',
			alignSelf: 'flex-end',
		}
		return avatar
	}

	protected generateAuthorName(): LayoutText {
		const authorName = new LayoutText({
			style: {
				fill: 0xff1010,
				fontSize: '20%',
			},
			text: this.options.author.name,
		})
		authorName.layout = {
			maxWidth: '100%',
			width: 'intrinsic',
			height: 'intrinsic',
		}
		return authorName
	}

	protected generateViewObject(): LayoutContainer {
		return new LayoutContainer({
			layout: {
				flexShrink: 0,
				display: 'flex',
				flexDirection:
					this.options.position === 'left' ? 'row' : 'row-reverse',
				alignSelf:
					this.options.position === 'left'
						? 'flex-start'
						: 'flex-end',
				width: '75%',
				marginTop: 10,
			},
		})
	}

	protected generateMessageContainer(): LayoutContainer {
		const layoutContainer = new LayoutContainer({
			layout: {
				alignItems: 'flex-start',
				backgroundColor: 0x3495eb,
				display: 'flex',
				flexDirection: 'column',
				marginBottom: 10,
				borderRadius: 10,
				maxWidth: '100%',
				objectFit: 'fill',
				padding: 10,
				gap: 5,
			},
		})

		layoutContainer.addChild(this.cornerRect)

		return layoutContainer
	}

	protected generateCornerRect(): Graphics {
		const cornerRect = new Graphics()
			.roundRect(0, 0, 20, 20, 0)
			.fill(0x3495eb)
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
}
