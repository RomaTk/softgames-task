export type TThrowNotCritical = (err: unknown) => void

export type TData<AvatarData, DialogueData> = {
	readonly dialogue: readonly DialogueData[]
	readonly avatars: readonly AvatarData[]
}

export type TOptions<DataLike, ThrowNotCriticalLike> = {
	readonly data: DataLike
	readonly throwNotCritical: ThrowNotCriticalLike
}

export type TGetAvatarTexture<TextureLike> = (url: string | null) => TextureLike

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

export abstract class MessagesBuilder<
	MessageLike,
	TextureLike,
	AvatarDataLike extends TAvatarData,
	DialogueDataLike extends TDialogueData,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
	ThrowNotCriticalLike extends TThrowNotCritical,
> {
	protected readonly data: DataLike
	protected readonly throwNotCritical: ThrowNotCriticalLike

	public constructor(options: TOptions<DataLike, ThrowNotCriticalLike>) {
		this.data = options.data
		this.throwNotCritical = options.throwNotCritical
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

	protected abstract getAvatarTexture(url: string | null): TextureLike

	protected abstract createMessage(
		messageData: TMessageData<TextureLike>,
	): MessageLike
}
