export type TMessageOptions<TextureLike> = {
	readonly author: {
		readonly name: string
		readonly texture: TextureLike
	}
	readonly text: string
	readonly position: 'left' | 'right'
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
	readonly resize: () => void | Promise<void>
	readonly afterInit?: Promise<void>
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
	readonly create: {
		readonly viewObject: (position: 'left' | 'right') => ViewObjectLike
		readonly authorName: (name: string) => AutorNameLike
		readonly messageText: (text: string) => MessageTextLike
		readonly avatar: (texture: () => TextureLike) => AvatarLike
		readonly cornerRect: (position: 'left' | 'right') => CornerRectLike
		readonly messageContainer: () => MessageContainerLike
	}
	readonly getHtmlTextWithImages: (
		text: string,
		emojies: TReadonlyEmojiesMap,
		throwNotCritical: (err: unknown) => void,
	) => string
}

export type TReadonlyEmojiesMap = {
	// It should be like (name: string) => base64 | undefined
	readonly get: (name: string) => string | undefined
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
	readonly mapEmojiToBase64: TReadonlyEmojiesMap
	readonly throwNotCritical: (err: unknown) => void
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
	TextureLike,
> {
	public readonly viewObject: ViewObjectLike
	protected isDestroyed: boolean
	protected readonly authorName: AutorNameLike
	protected readonly messageText: MessageTextLike
	protected readonly authorAvatar: AvatarLike
	protected readonly messageContainer: MessageContainerLike
	// HACK to cover the sharp corner of the message container
	protected readonly cornerRect: CornerRectLike
	protected readonly afterInitPromise: Promise<void>

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
		const htmlTextWithEmojies = opt.staticFunctions.getHtmlTextWithImages(
			opt.messageData.text,
			opt.mapEmojiToBase64,
			opt.throwNotCritical,
		)
		this.viewObject = opt.staticFunctions.create.viewObject(
			opt.messageData.position,
		)
		this.authorName = opt.staticFunctions.create.authorName(
			opt.messageData.author.name,
		)
		this.messageText =
			opt.staticFunctions.create.messageText(htmlTextWithEmojies)
		this.authorAvatar = opt.staticFunctions.create.avatar(
			() => opt.messageData.author.texture,
		)
		this.cornerRect = opt.staticFunctions.create.cornerRect(
			opt.messageData.position,
		)

		this.messageContainer = opt.staticFunctions.create.messageContainer()

		this.afterInitPromise = this.init()
	}

	public get afterInit(): Promise<void> {
		return this.afterInitPromise
	}

	public async resize(): Promise<void> {
		if (this.isDestroyed) {
			throw new Error('Cannot resize destroyed Message instance')
		}
		await this.messageText.resize()
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

	protected async init(): Promise<void> {
		this.messageContainer.addChild(
			this.cornerRect,
			this.authorName,
			this.messageText,
		)
		this.viewObject.addChild(this.authorAvatar, this.messageContainer)
		await this.messageText.afterInit
	}
}
