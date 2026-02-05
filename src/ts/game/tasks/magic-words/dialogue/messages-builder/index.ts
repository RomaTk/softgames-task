export type TThrowNotCritical = (err: unknown) => void

export type TData<AvatarData, DialogueData> = {
	readonly dialogue: readonly DialogueData[]
	readonly avatars: readonly AvatarData[]
}

export type TOptions<
	DataLike,
	ThrowNotCriticalLike,
	GetAvatarTextureLike,
	CreateMessageLike,
> = {
	readonly data: DataLike
	readonly throwNotCritical: ThrowNotCriticalLike
	readonly getAvatarTexture: GetAvatarTextureLike
	readonly createMessage: CreateMessageLike
}

export type TGetAvatarTexture<TextureLike> = (url: string | null) => TextureLike

export type TCreateMessage<MessageDataLike, MessageLike> = (
	messageData: MessageDataLike,
) => MessageLike

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

export type TDialogueData = {
	readonly name: string
	readonly text: string
}

export class MessagesBuilder<
	MessageLike,
	TextureLike,
	CreateMessageLike extends TCreateMessage<
		TMessageData<TextureLike>,
		MessageLike
	>,
	AvatarDataLike extends TAvatarData,
	DialogueDataLike extends TDialogueData,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
	ThrowNotCriticalLike extends TThrowNotCritical,
	GetAvatarTextureLike extends TGetAvatarTexture<TextureLike>,
> {
	protected readonly data: DataLike
	protected readonly throwNotCritical: ThrowNotCriticalLike
	protected readonly getAvatarTexture: GetAvatarTextureLike
	protected readonly createMessage: CreateMessageLike

	public constructor(
		options: TOptions<
			DataLike,
			ThrowNotCriticalLike,
			GetAvatarTextureLike,
			CreateMessageLike
		>,
	) {
		this.data = options.data
		this.throwNotCritical = options.throwNotCritical
		this.getAvatarTexture = options.getAvatarTexture
		this.createMessage = options.createMessage
	}

	public createMessages(): MessageLike[] {
		const messages: MessageLike[] = []
		for (const dialogueData of this.data.dialogue) {
			messages.push(this.createMessage(this.getMessageData(dialogueData)))
		}
		return messages
	}

	protected getAvatarDataByName(name: string): TAvatarData {
		const avatarData = this.data.avatars.find(
			(av: { readonly name: string }) => av.name === name,
		)
		if (!avatarData) {
			try {
				throw new Error(`Avatar for name "${name}" not found`)
			} catch (err) {
				this.throwNotCritical(err)
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

	protected getMessageData(
		dialogueData: DialogueDataLike,
	): TMessageData<TextureLike> {
		const avatar = this.getAvatarDataByName(dialogueData.name)
		return {
			author: {
				name: dialogueData.name,
				texture: this.getAvatarTexture(avatar.url),
			},
			position: avatar.position,
			text: dialogueData.text,
		}
	}
}
