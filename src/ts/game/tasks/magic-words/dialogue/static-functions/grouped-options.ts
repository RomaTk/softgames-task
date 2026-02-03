import { Message, type TOptions as TMessageOptionsGeneral } from './message.js'
import type { TOptions, TSize } from '../index.js'
import type { Texture } from 'pixi.js'
import { create as createScrollSpring } from './scroll-spring.js'
import { create as createViewObject } from './view-object.js'
import { getAvatarTexture } from './avatar-texture.js'

export type TGroupedOptions<SizeLike, Message> = Omit<
	TOptions<
		SizeLike,
		Message,
		ReturnType<typeof createScrollSpring>,
		ReturnType<typeof createViewObject>,
		Texture
	>,
	'create'
> & {
	create: {
		readonly message: (
			currentMessageData: TMessageOptionsGeneral['messageData'],
		) => Message
	} & Omit<
		TOptions<
			SizeLike,
			Message,
			ReturnType<typeof createScrollSpring>,
			ReturnType<typeof createViewObject>,
			Texture
		>['create'],
		'message'
	>
}

export const getGrouppedOptions = <SizeLike extends TSize>(
	size: SizeLike,
	messageOptionsGeneral: Omit<TMessageOptionsGeneral, 'messageData'>,
	throwNotCritical: (err: unknown) => void,
): TGroupedOptions<SizeLike, Message> => ({
	create: {
		message: (currentMessageData: TMessageOptionsGeneral['messageData']) =>
			new Message({
				...messageOptionsGeneral,
				messageData: currentMessageData,
			}),
		scrollSpring: createScrollSpring,
		viewObject: createViewObject,
	},
	getAvatarTexture,
	size,
	throwNotCritical,
})
