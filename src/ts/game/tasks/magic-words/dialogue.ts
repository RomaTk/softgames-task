import {
	Dialogue as DialogueComponent,
	type TSize,
} from './components/dialogue/index.js'
import { Container } from 'pixi.js'
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
	protected readonly minWidthViewObject: Container

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

		// Here we change structure, so even in really small screen it looks good
		this.minWidthViewObject = new Container()
		this.minWidthViewObject.addChild(
			...this.messages.map(
				<ViewObjectLike extends Container>(message: {
					readonly viewObject: ViewObjectLike
				}): ViewObjectLike => {
					message.viewObject.removeFromParent()
					return message.viewObject
				},
			),
		)
		this.minWidthViewObject.layout = {
			flexDirection: 'column',
			flexShrink: 0,
			minWidth: 200,
			width: '100%',
		}
		this.viewObject.addChild(this.minWidthViewObject)
	}
}
