import {
	Dialogue as DialogueComponent,
	type TSize,
} from './components/dialogue/index.js'
import type { Data } from './data.js'
import { MessagesBuilder } from './messages-builder.js'
import { create as createScrollSpring } from './components/dialogue/static-functions/scroll-spring.js'
import { create as createViewObject } from './components/dialogue/static-functions/view-object.js'

export class Dialogue<
	SizeLike extends TSize,
	DataLike extends Data,
> extends DialogueComponent<
	SizeLike,
	ReturnType<MessagesBuilder['createMessage']>,
	ReturnType<MessagesBuilder['createMessages']>,
	ReturnType<typeof createScrollSpring>,
	ReturnType<typeof createViewObject>
> {
	public constructor(
		size: SizeLike,
		data: DataLike,
		throwNotCritical: (err: unknown) => void,
	) {
		super({
			create: {
				messages: () =>
					new MessagesBuilder(
						data,
						throwNotCritical,
					).createMessages(),
				scrollSpring: createScrollSpring,
				viewObject: createViewObject,
			},
			size,
		})
	}
}
