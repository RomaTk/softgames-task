import {
	MessagesBuilder as MessagesBuilderComponent,
	type TMessageData,
} from './components/messages-builder/index.js'
import type { Data } from './data.js'
import { Message } from './message.js'
import { PreciseSizeHelper } from './precise-text-size-helper.js'
import { getAvatarTexture } from './components/messages-builder/static-functions/avatar-texture.js'

export class MessagesBuilder<
	DataLike extends Data = Data,
	ThrowNotCriticalLike extends (err: unknown) => void = (
		err: unknown,
	) => void,
	MessageData extends TMessageData<ReturnType<typeof getAvatarTexture>> =
		TMessageData<ReturnType<typeof getAvatarTexture>>,
> extends MessagesBuilderComponent<
	Message,
	ReturnType<typeof getAvatarTexture>,
	DataLike['avatars'][number],
	DataLike['dialogue'][number],
	DataLike
> {
	protected preciseSizeHelper?: PreciseSizeHelper
	protected override readonly getAvatarTexture = getAvatarTexture
	protected override readonly throwNotCritical

	public constructor(data: DataLike, throwNotCritical: ThrowNotCriticalLike) {
		super(data)
		this.throwNotCritical = throwNotCritical
	}

	public override createMessage(messageData: MessageData): Message {
		this.preciseSizeHelper ??= new PreciseSizeHelper(
			((): number => {
				// I took 2 sizes per each dialogue text, as one for each orientation
				const commonSizeChanges = ['landscape', 'portrait']
				return this.data.dialogue.length * commonSizeChanges.length
			})(),
		)
		return new Message(
			{
				mapEmojiToBase64: {
					get: (name: string) =>
						this.data.getEmojieData(name)?.base64,
				},
				messageData,
				throwNotCritical: this.throwNotCritical,
			},
			this.preciseSizeHelper,
		)
	}
}
