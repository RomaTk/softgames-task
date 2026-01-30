/* eslint-disable max-statements */
/* eslint-disable no-console */
/* eslint-disable max-lines-per-function */
import {
	BatchableHTMLText,
	Graphics,
	HTMLText,
	Rectangle,
	Texture,
	TextureSource,
} from 'pixi.js'
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
	MessageTextLike extends HTMLText,
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

		this.textLayoutFix()
	}

	public resize(): void {
		this.textLayoutFix()
	}

	protected getBatchableHTMLOfMessageText(): BatchableHTMLText | null {
		const gpuData = ((): HTMLText['_gpuData'] => {
				const key = '_gpuData'
				return this.messageText[key]
			})(),
			interestingIndex = 0

		return ((): BatchableHTMLText | null => {
			const batchableHTMLText = gpuData[interestingIndex]
			if (typeof batchableHTMLText === 'undefined') {
				return null
			}
			return batchableHTMLText
		})()
	}

	/*
		After onRender, could be extracted the size of message container
	 */
	protected textLayoutFix(): void {}
}
