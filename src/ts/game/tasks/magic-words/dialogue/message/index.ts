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

export type TViewWithChildren<ChildrenLike> = {
	readonly addChild: (...children: readonly ChildrenLike[]) => void
}

export type TViewDestroyable = {
	readonly destroy: (options: true) => void
}
export type TViewDestroyableNoOptions = {
	readonly destroy: () => void
}

export type TMessageLike = {
	readonly resize: () => void
} & TViewDestroyableNoOptions

export type TStaticFunctions<
	ViewObjectLike,
	AutorNameLike,
	MessageTextLike,
	AvatarLike,
	CornerRectLike,
	MessageContainerLike,
	TextureLike,
> = {
	readonly generateViewObject: (position: 'left' | 'right') => ViewObjectLike
	readonly generateAuthorName: (name: string) => AutorNameLike
	readonly generateMessageText: (text: string) => MessageTextLike
	readonly generateAvatar: (texture: TextureLike) => AvatarLike
	readonly generateCornerRect: (position: 'left' | 'right') => CornerRectLike
	readonly generateMessageContainer: () => MessageContainerLike
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
	ViewObjectLike,
	AutorNameLike,
	MessageTextLike,
	AvatarLike,
	CornerRectLike,
	MessageContainerLike,
	TextureLike,
> = {
	readonly staticFunctions: TStaticFunctions<
		ViewObjectLike,
		AutorNameLike,
		MessageTextLike,
		AvatarLike,
		CornerRectLike,
		MessageContainerLike,
		TextureLike
	>
	readonly messageData: TMessageOptions<TextureLike>
	readonly mapEmojiToBase64: ReadonlyMap<string, string>
	readonly throwNotCritical: (err: unknown) => void
	readonly htmlTextWithEmojies?: string
}

export class Message<
	ViewObjectLike extends TViewWithChildren<
		AvatarLike | MessageContainerLike
	> &
		TViewDestroyable,
	MessageContainerLike extends TViewWithChildren<
		CornerRectLike | AutorNameLike | MessageTextLike
	> &
		TViewDestroyable,
	AutorNameLike extends TViewDestroyable,
	MessageTextLike extends TMessageLike,
	AvatarLike extends TViewDestroyableNoOptions,
	CornerRectLike extends TViewDestroyable,
	TextureLike extends TViewDestroyable,
> {
	public readonly viewObject: ViewObjectLike
	protected isDestroyed: boolean
	protected readonly authorName: AutorNameLike
	protected readonly messageText: MessageTextLike
	protected readonly authorAvatar: AvatarLike
	protected readonly messageContainer: MessageContainerLike
	// HACK to cover the sharp corner of the message container
	protected readonly cornerRect: CornerRectLike

	public constructor(
		opt: TOptions<
			ViewObjectLike,
			AutorNameLike,
			MessageTextLike,
			AvatarLike,
			CornerRectLike,
			MessageContainerLike,
			TextureLike
		>,
	) {
		this.isDestroyed = false
		const htmlTextWithEmojies =
			opt.htmlTextWithEmojies ??
			opt.staticFunctions.generateHtmlTextWithImages(
				opt.messageData.text,
				opt.mapEmojiToBase64,
				opt.throwNotCritical,
			)
		this.viewObject = opt.staticFunctions.generateViewObject(
			opt.messageData.position,
		)
		this.authorName = opt.staticFunctions.generateAuthorName(
			opt.messageData.author.name,
		)
		this.messageText =
			opt.staticFunctions.generateMessageText(htmlTextWithEmojies)
		this.authorAvatar = opt.staticFunctions.generateAvatar(
			opt.messageData.author.texture,
		)
		this.cornerRect = opt.staticFunctions.generateCornerRect(
			opt.messageData.position,
		)

		this.messageContainer = opt.staticFunctions.generateMessageContainer()

		this.init()
	}

	public resize(): void {
		this.messageText.resize()
	}

	public destroy(): void {
		if (this.isDestroyed) {
			return
		}
		this.isDestroyed = true
		this.cornerRect.destroy(true)
		this.authorName.destroy(true)
		this.authorAvatar.destroy()
		this.messageText.destroy()
		this.messageContainer.destroy(true)
		this.viewObject.destroy(true)
	}

	protected init(): void {
		this.messageContainer.addChild(
			this.cornerRect,
			this.authorName,
			this.messageText,
		)
		this.viewObject.addChild(this.authorAvatar, this.messageContainer)
	}
}
