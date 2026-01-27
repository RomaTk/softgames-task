import { Graphics, Texture } from 'pixi.js'
import {
	LayoutContainer,
	LayoutHTMLText,
	LayoutSprite,
	LayoutText,
} from '@pixi/layout/components'

export type TMessageOptions<TextureLike> = {
	readonly author: {
		readonly name: string
		readonly texture: TextureLike
	}
	readonly text: string
	readonly position: 'left' | 'right'
}

export type TSizeHelper = {
	readonly width: number
	readonly height: number
}

export type TErrorCatcher = {
	readonly throw: (err: unknown, isResolved: boolean) => void
}

export type TStaticFunctions<
	ViewObjectLike,
	AutorNameLike,
	MessageTextLike,
	AvatarLike,
	CornerRectLike,
	SizeHelpersLike,
	MessageContainerLike,
	TextureLike,
> = {
	readonly generateViewObject: (position: 'left' | 'right') => ViewObjectLike
	readonly generateAuthorName: (name: string) => AutorNameLike
	readonly generateMessageText: (
		isWordWrap: boolean,
		text: string,
	) => MessageTextLike
	readonly generateAvatar: (texture: TextureLike) => AvatarLike
	readonly generateCornerRect: (position: 'left' | 'right') => CornerRectLike
	readonly generateMessageContainer: () => MessageContainerLike
	readonly getSizeHelpers: (
		authorName: string,
		messageText: string,
	) => SizeHelpersLike
	readonly generateHtmlTextWithImages: (
		text: string,
		emojies: ReadonlyMap<string, string>,
		throwNotCritical: (err: unknown) => void,
	) => string
}

export type TSizeHelpers = {
	readonly authorName: TSizeHelper
	readonly message: TSizeHelper
}

export type TOptions<
	ErrorCatcherLike,
	ViewObjectLike,
	AutorNameLike,
	MessageTextLike,
	AvatarLike,
	CornerRectLike,
	SizeHelpersLike,
	MessageContainerLike,
	TextureLike,
> = {
	readonly errorCatcher: ErrorCatcherLike
	readonly staticFunctions: TStaticFunctions<
		ViewObjectLike,
		AutorNameLike,
		MessageTextLike,
		AvatarLike,
		CornerRectLike,
		SizeHelpersLike,
		MessageContainerLike,
		TextureLike
	>
	readonly messageData: TMessageOptions<TextureLike>
	readonly mapEmojiToBase64: ReadonlyMap<string, string>
	readonly forceRender: () => void
}

export class Message<
	ViewObjectLike extends LayoutContainer,
	MessageContainerLike extends LayoutContainer,
	AutorNameLike extends LayoutText,
	MessageTextLike extends LayoutHTMLText,
	AvatarLike extends LayoutSprite,
	CornerRectLike extends Graphics,
	SizeHelpersLike extends TSizeHelpers,
	ErrorCatcherLike extends TErrorCatcher,
	TextureLike extends Texture,
> {
	public readonly viewObject: ViewObjectLike
	protected readonly errorCatcher: ErrorCatcherLike
	protected readonly authorName: AutorNameLike
	protected readonly messageText: MessageTextLike
	protected readonly authorAvatar: AvatarLike
	protected readonly messageContainer: MessageContainerLike
	// HACK to cover the sharp corner of the message container
	protected readonly cornerRect: CornerRectLike
	protected readonly sizeHelpers: SizeHelpersLike
	protected readonly forceRender: () => void

	public constructor(
		opt: TOptions<
			ErrorCatcherLike,
			ViewObjectLike,
			AutorNameLike,
			MessageTextLike,
			AvatarLike,
			CornerRectLike,
			SizeHelpersLike,
			MessageContainerLike,
			TextureLike
		>,
	) {
		this.errorCatcher = opt.errorCatcher
		this.forceRender = opt.forceRender
		const htmlTextWithEmojies =
			opt.staticFunctions.generateHtmlTextWithImages(
				opt.messageData.text,
				opt.mapEmojiToBase64,
				(err: unknown): void => {
					this.errorCatcher.throw(err, true)
				},
			)
		this.viewObject = opt.staticFunctions.generateViewObject(
			opt.messageData.position,
		)
		this.authorName = opt.staticFunctions.generateAuthorName(
			opt.messageData.author.name,
		)
		this.messageText = opt.staticFunctions.generateMessageText(
			true,
			htmlTextWithEmojies,
		)
		this.authorAvatar = opt.staticFunctions.generateAvatar(
			opt.messageData.author.texture,
		)
		this.cornerRect = opt.staticFunctions.generateCornerRect(
			opt.messageData.position,
		)
		this.sizeHelpers = opt.staticFunctions.getSizeHelpers(
			opt.messageData.author.name,
			htmlTextWithEmojies,
		)
		this.messageContainer = opt.staticFunctions.generateMessageContainer()

		this.init()
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
	}

	protected init(): void {
		this.messageContainer.addChild(
			this.cornerRect,
			this.authorName,
			this.messageText,
		)
		this.viewObject.addChild(this.authorAvatar)
		this.viewObject.addChild(this.messageContainer)
		this.textLayoutFix()
	}

	protected textLayoutFix(): void {
		this.messageText.onRender = (): void => {
			this.messageText.onRender = null
			const paddinngMargin = 30,
				saveHeight = 20
			// Full size - size of text less then 100% width
			if (
				this.sizeHelpers.message.width + paddinngMargin <
				this.messageContainer.width
			) {
				this.messageText.layout = {
					height:
						this.sizeHelpers.message.height +
						saveHeight +
						this.sizeHelpers.authorName.height,
					width: this.sizeHelpers.message.width + paddinngMargin,
				}
			} else {
				this.messageText.layout = {
					height:
						((this.sizeHelpers.message.width + paddinngMargin) /
							this.messageContainer.width) *
							this.sizeHelpers.message.height +
						saveHeight +
						this.sizeHelpers.authorName.height,
					width: '100%',
				}
				this.forceRender()
			}
		}
	}
}
