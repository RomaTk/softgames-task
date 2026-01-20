import {
	LayoutContainer,
	LayoutHTMLText,
	LayoutSprite,
	LayoutText,
} from '@pixi/layout/components'
import { Texture } from 'pixi.js'

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

	public constructor(options: TMessageOptions) {
		this.options = options

		this.viewObject = this.generateViewObject()
		this.authorName = this.generateAuthorName()
		this.authorAvatar = this.generateAvatar()
		this.messageText = this.generateMessageText()
		this.messageContainer = this.generateMessageContainer()

		this.messageContainer.addChild(this.authorName)
		this.viewObject.addChild(this.authorAvatar)
		this.viewObject.addChild(this.messageContainer)

		console.log('Created message:', this)
	}

	public destroy(): void {
		this.authorName.destroy(true)
		this.authorAvatar.destroy(true)
		this.messageText.destroy(true)
		this.viewObject.destroy(true)
	}

	protected generateMessageText(): LayoutHTMLText {
		const messageText = new LayoutHTMLText({
			style: {
				fill: 0xff1010,
				wordWrap: true,
				wordWrapWidth: 400,
			},
			text: this.options.text,
		})
		messageText.layout = {}
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
			maxHeight: '100%',
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
				fontSize: 24,
			},
			text: this.options.author.name,
		})
		authorName.layout = {
			height: '100%',
			maxHeight: 20,
			maxWidth: '100%',
			objectFit: 'scale-down',
		}
		return authorName
	}

	protected generateViewObject(): LayoutContainer {
		return new LayoutContainer({
			layout: {
				flexShrink: 0,
				// HACK need to set width not intrinsic and then maxWidth to make it work correctly
				width: '100%',
				display: 'flex',
				flexDirection:
					this.options.position === 'left' ? 'row' : 'row-reverse',
				alignSelf:
					this.options.position === 'left'
						? 'flex-start'
						: 'flex-end',
				maxWidth: '75%',
			},
		})
	}

	protected generateMessageContainer(): LayoutContainer {
		return new LayoutContainer({
			layout: {
				alignItems: 'flex-start',
				backgroundColor: 0x3495eb,
				display: 'flex',
				flexDirection: 'column',
				width: 'intrinsic',
				minWidth: '20%',
				height: 'auto',
			},
		})
	}
}
