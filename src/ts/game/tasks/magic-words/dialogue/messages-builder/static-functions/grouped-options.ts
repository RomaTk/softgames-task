import { Message, type TOptions as TMessageOptions } from './message.js'
import type {
	TData,
	TMessageData,
	TOptions as TOptionsMessagesBuilder,
	TThrowNotCritical,
} from '../index.js'
import { getAvatarTexture } from './avatar-texture.js'

export type TOptions<ThrowNotCriticalLike, DataLike> = {
	readonly throwNotCritical: ThrowNotCriticalLike
	readonly data: DataLike
	readonly preciseSizeHelper: TMessageOptions['preciseSizeHelper']
	readonly mapEmojiToBase64: TMessageOptions['mapEmojiToBase64']
}

export const getGroupedOptions = <
	AvatarDataLike,
	DialogueDataLike,
	ThrowNotCriticalLike extends TThrowNotCritical,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
>(
	options: TOptions<ThrowNotCriticalLike, DataLike>,
): TOptionsMessagesBuilder<
	DataLike,
	ThrowNotCriticalLike,
	typeof getAvatarTexture,
	(messageData: TMessageData<ReturnType<typeof getAvatarTexture>>) => Message
> => ({
	createMessage: (
		messageData: TMessageData<ReturnType<typeof getAvatarTexture>>,
	) =>
		new Message({
			mapEmojiToBase64: options.mapEmojiToBase64,
			messageData,
			preciseSizeHelper: options.preciseSizeHelper,
			throwNotCritical: options.throwNotCritical,
		}),
	data: options.data,
	getAvatarTexture,
	throwNotCritical: options.throwNotCritical,
})
