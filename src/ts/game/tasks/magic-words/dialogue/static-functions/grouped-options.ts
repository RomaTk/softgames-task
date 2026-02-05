import { TOptions } from '../index.js'
import { TReadonlyEmojiesMap } from '../message/index.js'
import {
	TAvatarData,
	TData,
	TDialogueData,
	TThrowNotCritical,
} from '../messages-builder/index.js'
import { MessagesBuilder } from './messages-builder.js'
import { create as createScrollSpring } from './scroll-spring.js'
import { create as createViewObject } from './view-object.js'

export type TMessagesLike<
	AvatarDataLike extends TAvatarData,
	DialogueDataLike extends TDialogueData,
	ThrowNotCriticalLike extends TThrowNotCritical,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
> = ReturnType<
	MessagesBuilder<
		AvatarDataLike,
		DialogueDataLike,
		ThrowNotCriticalLike,
		DataLike
	>['createMessages']
>

export const getGroupedOptions = <
	SizeLike,
	AvatarDataLike extends TAvatarData,
	DialogueDataLike extends TDialogueData,
	ThrowNotCriticalLike extends TThrowNotCritical,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
>(
	size: SizeLike,
	throwNotCritical: ThrowNotCriticalLike,
	mapEmojiToBase64: TReadonlyEmojiesMap,
	pe
): TOptions<
	SizeLike,
	TMessagesLike<
		AvatarDataLike,
		DialogueDataLike,
		ThrowNotCriticalLike,
		DataLike
	>,
	ReturnType<typeof createScrollSpring>,
	ReturnType<typeof createViewObject>
> => ({
	create: {
		scrollSpring: createScrollSpring,
		viewObject: createViewObject,
		messages: () =>
			new MessagesBuilder<
				AvatarDataLike,
				DialogueDataLike,
				ThrowNotCriticalLike,
				DataLike
			>({
				throwNotCritical,
				mapEmojiToBase64,
				'preciseSizeHelper': 
			}).createMessages(),
	},
	size,
})
