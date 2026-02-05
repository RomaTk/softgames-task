import {
	MessagesBuilder as MessagesBuilderGeneral,
	type TAvatarData,
	type TData,
	type TDialogueData,
	type TThrowNotCritical,
} from '../messages-builder/index.js'
import {
	type TOptions,
	getGroupedOptions as getGroupedOptionsMessageBuilder,
} from '../messages-builder/static-functions/grouped-options.js'

export type TCreateMessage<
	AvatarDataLike,
	DialogueDataLike,
	ThrowNotCriticalLike extends TThrowNotCritical,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
> = ReturnType<
	typeof getGroupedOptionsMessageBuilder<
		AvatarDataLike,
		DialogueDataLike,
		ThrowNotCriticalLike,
		DataLike
	>
>['createMessage']

export type TMessage<
	AvatarDataLike,
	DialogueDataLike,
	ThrowNotCriticalLike extends TThrowNotCritical,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
> = ReturnType<
	TCreateMessage<
		AvatarDataLike,
		DialogueDataLike,
		ThrowNotCriticalLike,
		DataLike
	>
>

export type TGetAvatarTexture<
	AvatarDataLike,
	DialogueDataLike,
	ThrowNotCriticalLike extends TThrowNotCritical,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
> = ReturnType<
	typeof getGroupedOptionsMessageBuilder<
		AvatarDataLike,
		DialogueDataLike,
		ThrowNotCriticalLike,
		DataLike
	>
>['getAvatarTexture']

export type TTexture<
	AvatarDataLike,
	DialogueDataLike,
	ThrowNotCriticalLike extends TThrowNotCritical,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
> = ReturnType<
	TGetAvatarTexture<
		AvatarDataLike,
		DialogueDataLike,
		ThrowNotCriticalLike,
		DataLike
	>
>

export class MessagesBuilder<
	AvatarDataLike extends TAvatarData,
	DialogueDataLike extends TDialogueData,
	ThrowNotCriticalLike extends TThrowNotCritical,
	DataLike extends TData<AvatarDataLike, DialogueDataLike>,
> extends MessagesBuilderGeneral<
	TMessage<AvatarDataLike, DialogueDataLike, ThrowNotCriticalLike, DataLike>,
	TTexture<AvatarDataLike, DialogueDataLike, ThrowNotCriticalLike, DataLike>,
	TCreateMessage<
		AvatarDataLike,
		DialogueDataLike,
		ThrowNotCriticalLike,
		DataLike
	>,
	AvatarDataLike,
	DialogueDataLike,
	DataLike,
	ThrowNotCriticalLike,
	TGetAvatarTexture<
		AvatarDataLike,
		DialogueDataLike,
		ThrowNotCriticalLike,
		DataLike
	>
> {
	public constructor(options: TOptions<ThrowNotCriticalLike, DataLike>) {
		super(getGroupedOptionsMessageBuilder(options))
	}
}
