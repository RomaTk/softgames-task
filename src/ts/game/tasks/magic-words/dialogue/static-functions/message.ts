import type { HTMLText, Texture } from 'pixi.js'
import {
	Message as MessageGeneral,
	type TOptions as TMessageOptionsGeneral,
} from '../message/index.js'
import type { TPreciseSizeHelper } from '../message/message-text/index.js'
import { getGrouppedStaticFunctions } from '../message/static-functions/index.js'

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

export class Message extends MessageGeneral<
	ReturnType<
		ReturnType<typeof getGrouppedStaticFunctions>['create']['viewObject']
	>,
	ReturnType<
		ReturnType<
			typeof getGrouppedStaticFunctions
		>['create']['messageContainer']
	>,
	ReturnType<
		ReturnType<typeof getGrouppedStaticFunctions>['create']['authorName']
	>,
	ReturnType<
		ReturnType<typeof getGrouppedStaticFunctions>['create']['messageText']
	>,
	ReturnType<
		ReturnType<typeof getGrouppedStaticFunctions>['create']['avatar']
	>,
	ReturnType<
		ReturnType<typeof getGrouppedStaticFunctions>['create']['cornerRect']
	>,
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
