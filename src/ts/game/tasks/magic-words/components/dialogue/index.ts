export type TSize = {
	readonly width: number
	readonly height: number
}

export type TMessageLike = {
	readonly viewObject: unknown
	readonly resize: () => Promise<void>
	readonly destroy: () => void
	readonly afterInit: Promise<void>
}

export type TViewObjectLike<MessageViewObjectLike> = {
	readonly layout: {
		readonly setStyle: (style: {
			readonly width: number
			readonly height: number
		}) => void
	} | null
	readonly addChild: (...children: readonly MessageViewObjectLike[]) => void
	readonly destroy: (options: true) => void
}

export type TOptions<SizeLike, MessagesLike, ScrollSpringLike, ViewObjectLike> =
	{
		readonly create: {
			readonly viewObject: (
				scrollSpring: ScrollSpringLike,
			) => ViewObjectLike
			readonly scrollSpring: () => ScrollSpringLike
			readonly messages: () => MessagesLike
		}
		readonly size: SizeLike
	}

export class Dialogue<
	SizeLike extends TSize,
	MessageLike extends TMessageLike,
	MessagesLike extends readonly MessageLike[],
	ScrollSpringLike,
	ViewObjectLike extends TViewObjectLike<MessageLike['viewObject']>,
> {
	public readonly viewObject: ViewObjectLike
	protected readonly messages: MessagesLike
	protected readonly scrollSpring: ScrollSpringLike
	protected readonly size: SizeLike
	protected readonly initPromise: Promise<void>

	public constructor(
		options: TOptions<
			SizeLike,
			MessagesLike,
			ScrollSpringLike,
			ViewObjectLike
		>,
	) {
		this.size = options.size
		this.scrollSpring = options.create.scrollSpring()
		this.viewObject = options.create.viewObject(this.scrollSpring)
		this.messages = options.create.messages()
		this.viewObject.addChild(...this.messages.map((msg) => msg.viewObject))
		this.initPromise = this.init()
	}

	public get afterInit(): Promise<void> {
		return this.initPromise
	}

	public async resize(): Promise<void> {
		this.resizeOnlyViewObject()
		await Promise.all(
			this.messages.map(
				async (message): Promise<void> => message.resize(),
			),
		)
	}

	public destroy(): void {
		this.messages.forEach((message) => {
			message.destroy()
		})
		this.viewObject.destroy(true)
	}

	protected async init(): Promise<void> {
		this.resizeOnlyViewObject()
		await Promise.all(
			this.messages.map(
				async (message): Promise<void> => message.afterInit,
			),
		)
	}

	protected resizeOnlyViewObject(): void {
		if (this.viewObject.layout === null) {
			throw new Error('Layout is not initialized yet')
		}
		this.viewObject.layout.setStyle({
			height: this.size.height,
			width: this.size.width,
		})
	}
}
