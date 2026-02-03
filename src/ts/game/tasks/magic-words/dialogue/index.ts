import type { Data as DataFromEndpoint } from '../data.js'

export type TSize = {
	readonly width: number
	readonly height: number
}

export type TMessageData<TextureLike> = {
	readonly author: {
		readonly name: string
		readonly texture: TextureLike
	}
	readonly position: 'left' | 'right'
	readonly text: string
}

export type TAvatarData = {
	readonly name: string
	readonly position: 'left' | 'right'
	readonly url: string | null
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

export type TOptions<
	SizeLike,
	MessageLike,
	ScrollSpringLike,
	ViewObjectLike,
	TextureLike,
> = {
	readonly create: {
		readonly viewObject: (scrollSpring: ScrollSpringLike) => ViewObjectLike
		readonly scrollSpring: () => ScrollSpringLike
		readonly message: (
			messageData: TMessageData<TextureLike>,
		) => MessageLike
	}
	readonly getAvatarTexture: (url: string | null) => TextureLike
	readonly throwNotCritical: (err: unknown) => void
	readonly size: SizeLike
}

export class Dialogue<
	SizeLike extends TSize,
	MessageLike extends TMessageLike,
	ScrollSpringLike,
	ViewObjectLike extends TViewObjectLike<MessageLike['viewObject']>,
	TextureLike,
	Data extends DataFromEndpoint,
> {
	public readonly viewObject: ViewObjectLike
	protected readonly data: Data
	protected readonly messages: readonly MessageLike[]
	protected readonly scrollSpring: ScrollSpringLike
	protected readonly size: SizeLike
	protected readonly initPromise: Promise<void>

	public constructor(
		options: TOptions<
			SizeLike,
			MessageLike,
			ScrollSpringLike,
			ViewObjectLike,
			TextureLike
		>,
		data: Data,
	) {
		this.size = options.size
		this.scrollSpring = options.create.scrollSpring()
		this.viewObject = options.create.viewObject(this.scrollSpring)
		this.data = data
		this.messages = this.createMessages(
			options.create.message,
			options.getAvatarTexture,
			options.throwNotCritical,
		)
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

	protected createMessages(
		createMessage: (messageData: TMessageData<TextureLike>) => MessageLike,
		getAvatarTexture: (url: string | null) => TextureLike,
		throwNotCritical: (err: unknown) => void,
	): MessageLike[] {
		const messages: MessageLike[] = []
		for (const dialogueData of this.data.dialogue) {
			messages.push(
				createMessage(
					this.getMessageData(
						dialogueData,
						getAvatarTexture,
						throwNotCritical,
					),
				),
			)
		}
		return messages
	}

	protected getAvatarDataByName(
		name: string,
		throwNotCritical: (err: unknown) => void,
	): TAvatarData {
		const avatarData = this.data.avatars.find(
			(av: { readonly name: string }) => av.name === name,
		)
		if (!avatarData) {
			try {
				throw new Error(`Avatar for name "${name}" not found`)
			} catch (err) {
				throwNotCritical(err)
			}

			return {
				name: 'unknown',
				position: ((): 'left' | 'right' => {
					const equalChance = 0.5
					if (Math.random() < equalChance) {
						return 'left'
					}
					return 'right'
				})(),
				url: null,
			}
		}

		return avatarData
	}

	protected getMessageData<T>(
		dialogueData: {
			readonly name: string
			readonly text: string
		},
		getAvatarTexture: (url: string | null) => T,
		throwNotCritical: (err: unknown) => void,
	): TMessageData<T> {
		const avatar = this.getAvatarDataByName(
			dialogueData.name,
			throwNotCritical,
		)
		return {
			author: {
				name: dialogueData.name,
				texture: getAvatarTexture(avatar.url),
			},
			position: avatar.position,
			text: dialogueData.text,
		}
	}
}
