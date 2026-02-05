import {
	Message as MessageComponent,
	type TOptions as TMessageComponentOptions,
} from './components/message/index.js'
import type { getAvatarTexture } from './components/messages-builder/static-functions/avatar-texture.js'
import { getGrouppedStaticFunctions as getMessageGrouppedStaticFunctions } from './components/message/static-functions/index.js'
import { preciseSizeHelper } from './precise-text-size-helper.js'

export type TGMessageGroupFunct = typeof getMessageGrouppedStaticFunctions<
	typeof preciseSizeHelper
>

export type TOptions = Omit<
	TMessageComponentOptions<
		unknown,
		unknown,
		unknown,
		unknown,
		unknown,
		unknown,
		ReturnType<typeof getAvatarTexture>
	>,
	'staticFunctions'
>

export class Message extends MessageComponent<
	ReturnType<ReturnType<TGMessageGroupFunct>['create']['viewObject']>,
	ReturnType<ReturnType<TGMessageGroupFunct>['create']['messageContainer']>,
	ReturnType<ReturnType<TGMessageGroupFunct>['create']['authorName']>,
	ReturnType<ReturnType<TGMessageGroupFunct>['create']['messageText']>,
	ReturnType<ReturnType<TGMessageGroupFunct>['create']['avatar']>,
	ReturnType<ReturnType<TGMessageGroupFunct>['create']['cornerRect']>,
	ReturnType<typeof getAvatarTexture>
> {
	public constructor(options: TOptions) {
		super({
			...options,
			staticFunctions:
				getMessageGrouppedStaticFunctions(preciseSizeHelper),
		})
	}
}
