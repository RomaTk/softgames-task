import { Graphics, Texture } from 'pixi.js'
import {
	LayoutContainer,
	LayoutHTMLText,
	LayoutSprite,
	LayoutText,
} from '@pixi/layout/components'
import {
	MessageWithoutHack,
	type TOptions as TOptionsWithoutHack,
	type TStaticFunctions as TStaticFunctionsWithoutHack,
} from './without-hack.js'
import { gsap } from 'gsap'

export type TSizeHelper = {
	readonly width: number
	readonly height: number
}

export type TStaticFunctions<
	ViewObjectLike,
	AutorNameLike,
	MessageTextLike,
	AvatarLike,
	CornerRectLike,
	MessageContainerLike,
	TextureLike,
	SizeHelpersLike,
> = {
	readonly getSizeHelpers: (
		authorName: string,
		messageText: string,
	) => SizeHelpersLike
} & TStaticFunctionsWithoutHack<
	ViewObjectLike,
	AutorNameLike,
	MessageTextLike,
	AvatarLike,
	CornerRectLike,
	MessageContainerLike,
	TextureLike
>

export type TSizeHelpers = {
	readonly authorName: TSizeHelper
	readonly message: TSizeHelper
}

export type TOptions<
	ViewObjectLike,
	AutorNameLike,
	MessageTextLike,
	AvatarLike,
	CornerRectLike,
	MessageContainerLike,
	TextureLike,
	SizeHelpersLike,
> = {
	readonly staticFunctions: TStaticFunctions<
		ViewObjectLike,
		AutorNameLike,
		MessageTextLike,
		AvatarLike,
		CornerRectLike,
		MessageContainerLike,
		TextureLike,
		SizeHelpersLike
	>
	readonly forceRender: () => void
} & TOptionsWithoutHack<
	ViewObjectLike,
	AutorNameLike,
	MessageTextLike,
	AvatarLike,
	CornerRectLike,
	MessageContainerLike,
	TextureLike
>

export class Message<
	ViewObjectLike extends LayoutContainer,
	MessageContainerLike extends LayoutContainer,
	AutorNameLike extends LayoutText,
	MessageTextLike extends LayoutHTMLText,
	AvatarLike extends LayoutSprite,
	CornerRectLike extends Graphics,
	TextureLike extends Texture,
	SizeHelpersLike extends TSizeHelpers,
> extends MessageWithoutHack<
	ViewObjectLike,
	MessageContainerLike,
	AutorNameLike,
	MessageTextLike,
	AvatarLike,
	CornerRectLike,
	TextureLike
> {
	protected readonly sizeHelpers: SizeHelpersLike
	protected readonly forceRender: () => void

	public constructor(
		opt: TOptions<
			ViewObjectLike,
			AutorNameLike,
			MessageTextLike,
			AvatarLike,
			CornerRectLike,
			MessageContainerLike,
			TextureLike,
			SizeHelpersLike
		>,
	) {
		const htmlTextWithEmojies =
			opt.staticFunctions.generateHtmlTextWithImages(
				opt.messageData.text,
				opt.mapEmojiToBase64,
				opt.throwNotCritical,
			)
		super({ ...opt, htmlTextWithEmojies })
		this.forceRender = opt.forceRender
		this.sizeHelpers = opt.staticFunctions.getSizeHelpers(
			opt.messageData.author.name,
			htmlTextWithEmojies,
		)
		this.messageText.onRender = (): void => {
			this.messageText.onRender = null
			this.textLayoutFix(true)
		}
	}

	public resize(): void {
		this.textLayoutFix(false)
	}

	protected textLayoutFix(isInit: boolean): void {
		// gsap.delayedCall(0.5, (): void => {
		// 	console.log('On layout fired')
		// 	// this.messageText.onRender = null
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
				width: '90%',
			}
			this.messageText.layout = {
				height:
					((this.sizeHelpers.message.width + paddinngMargin) /
						this.messageContainer.width) *
						this.sizeHelpers.message.height +
					saveHeight +
					this.sizeHelpers.authorName.height,

				width: '100%',
			}
		}
		window.messageText = this.messageText
		// this.messageContainer.onLayout = () => {
		// 	console.log('message container layout done')
		// }
		// if (isInit) {
		this.forceRender()
		// }
		// this.textLayoutFix(false)
		// })
	}
}
