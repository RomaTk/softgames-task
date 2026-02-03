import { TOptions, TSize } from '../index.js'
import { Message, TOptions as TMessageOptionsGeneral } from './message.js'
import { create as createScrollSpring } from './scroll-spring.js'
import { create as createViewObject } from './view-object.js'

export type TGroupedOptions<SizeLike, Message> = Omit<
	TOptions<
		SizeLike,
		Message,
		ReturnType<typeof createScrollSpring>,
		ReturnType<typeof createViewObject>
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
			ReturnType<typeof createViewObject>
		>['create'],
		'message'
	>
}

export const getGrouppedOptions = <SizeLike extends TSize>(
	size: SizeLike,
	messageOptionsGeneral: Omit<TMessageOptionsGeneral, 'messageData'>,
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
	size,
})
