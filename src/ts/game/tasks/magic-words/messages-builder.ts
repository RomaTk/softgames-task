import {
	MessagesBuilder as MessagesBuilderComponent,
	type TMessageData,
} from './components/messages-builder/index.js'
import type { Data } from './data.js'
import { Message } from './message.js'
import { getAvatarTexture } from './components/messages-builder/static-functions/avatar-texture.js'

export class MessagesBuilder<
	DataLike extends Data = Data,
> extends MessagesBuilderComponent<
	Message,
	ReturnType<typeof getAvatarTexture>,
	DataLike['avatars'][number],
	DataLike['dialogue'][number],
	DataLike
> {
	public override readonly getAvatarTexture = getAvatarTexture
	public override readonly throwNotCritical

	public constructor(
		data: DataLike,
		throwNotCritical: (err: unknown) => void,
	) {
		super(data)
		this.throwNotCritical = throwNotCritical
	}

	public override createMessage(
		messageData: TMessageData<ReturnType<typeof getAvatarTexture>>,
	): Message {
		return new Message({
			mapEmojiToBase64: {
				get: (name: string) => this.data.getEmojieData(name)?.base64,
			},
			messageData,
			throwNotCritical: this.throwNotCritical,
		})
	}
}
