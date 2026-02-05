import type { HTMLText, Texture } from 'pixi.js'
import {
	Message as MessageGeneral,
	type TOptions as TMessageOptionsGeneral,
} from '../../message/index.js'
import type { TPreciseSizeHelper } from '../../message/message-text/index.js'
import { getGrouppedStaticFunctions } from '../../message/static-functions/index.js'

export type TOptions = Omit<
	TMessageOptionsGeneral<
		unknown,
		unknown,
		unknown,
		unknown,
		unknown,
		unknown,
		Texture
	>,
	'staticFunctions'
> & {
	readonly preciseSizeHelper: TPreciseSizeHelper<HTMLText>
}

export type TViewObject = ReturnType<
	ReturnType<typeof getGrouppedStaticFunctions>['create']['viewObject']
>

export type TMessageContainer = ReturnType<
	ReturnType<typeof getGrouppedStaticFunctions>['create']['messageContainer']
>

export type TAuthorName = ReturnType<
	ReturnType<typeof getGrouppedStaticFunctions>['create']['authorName']
>

export type TMessageText = ReturnType<
	ReturnType<typeof getGrouppedStaticFunctions>['create']['messageText']
>

export type TAvatar = ReturnType<
	ReturnType<typeof getGrouppedStaticFunctions>['create']['avatar']
>

export type TCornerRect = ReturnType<
	ReturnType<typeof getGrouppedStaticFunctions>['create']['cornerRect']
>

export class Message extends MessageGeneral<
	TViewObject,
	TMessageContainer,
	TAuthorName,
	TMessageText,
	TAvatar,
	TCornerRect,
	Texture
> {
	public constructor(options: TOptions) {
		super({
			mapEmojiToBase64: options.mapEmojiToBase64,
			messageData: options.messageData,
			staticFunctions: getGrouppedStaticFunctions(
				options.preciseSizeHelper,
			),
			throwNotCritical: options.throwNotCritical,
		})
	}
}
