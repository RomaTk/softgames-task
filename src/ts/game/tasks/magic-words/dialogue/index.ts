import { LayoutContainer, ScrollSpring } from '@pixi/layout/components'
import type { Data as DataFromEndpoint } from '../data.js'
import { ErrorCatcher } from '../../../error-catcher.js'
import { Message } from './message/index.js'
import { getGrouppedStaticFunctions } from './message/static-functions/index.js'
import { Texture } from 'pixi.js'
import { PreciseSizeHelper } from './message/message-text/precise-size-helper/index.js'
import { styleContentParser } from './message/message-text/precise-size-helper/style-content-parser.js'
import { PreciseSizeHelperCache } from './message/message-text/precise-size-helper/cache.js'

const preciseHelper = new PreciseSizeHelper(
	styleContentParser,
	new PreciseSizeHelperCache<DOMRect>(10),
)

export type TSize = {
	readonly width: number
	readonly height: number
}

export type TMessageLike = {
	readonly viewObject: unknown
}

export type TViewObjectLike<
	MessageLike extends { readonly viewObject: unknown },
> = {
	readonly addChild: (
		...children: readonly MessageLike['viewObject'][]
	) => void
}

// Take into account that this class can be used only after initialization of application with layout plugin
export class Dialogue<
	SizeLike extends TSize,
	Data extends DataFromEndpoint,
	MessageLike extends TMessageLike,
> {
	public readonly viewObject: TViewObjectLike<MessageLike>
	protected readonly data: Data
	protected readonly messages: readonly MessageLike[]
	protected readonly scrollSpring: ScrollSpring
	protected readonly size: SizeLike

	public constructor(size: SizeLike, data: Data) {
		this.size = size
		this.scrollSpring = new ScrollSpring({
			damp: 0.7,
			max: 200,
			springiness: 0.15,
		})
		this.viewObject = new LayoutContainer({
			layout: {
				overflow: 'scroll',
			},
			trackpad: {
				constrain: true,
				disableEasing: false,
				maxSpeed: 400,
				yEase: this.scrollSpring,
			},
		})
		this.data = data
		this.messages = this.createMessages()
		this.viewObject.addChild(...this.messages.map((msg) => msg.viewObject))
		// HACK Here alpha is used as hack (look more in message (wrap + layout problem) )
		this.viewObject.alpha = 0.001
		this.viewObject.layout = {
			display: 'flex',
			flexDirection: 'column',
		}

		this.viewObject.alpha = 1
		this.resize()
	}

	public resize(): void {
		this.viewObject.layout = {
			height: this.size.height,
			width: this.size.width,
		}
		this.messages.forEach((message: { readonly resize: () => void }) => {
			message.resize()
		})
	}

	public destroy(): void {
		this.messages.forEach((message: { readonly destroy: () => void }) => {
			message.destroy()
		})
		this.viewObject.destroy(true)
	}

	protected createMessages(): MessageLike[] {
		const messages: MessageLike[] = []
		for (const messageData of this.data.dialogue) {
			messages.push(this.createMessage(messageData))
		}
		return messages
	}

	// eslint-disable-next-line max-lines-per-function
	protected createMessage(messageData: {
		readonly name: string
		readonly text: string
	}): MessageLike {
		const avatar = (():
			| {
					readonly name: string
					readonly position: 'left' | 'right'
					readonly url: string
			  }
			| undefined => {
			const avatars: readonly {
				readonly name: string
				readonly position: 'left' | 'right'
				readonly url: string
			}[] = this.data.avatars
			return avatars.find((av) => av.name === messageData.name)
		})()

		if (!avatar) {
			try {
				throw new Error(
					`Avatar for name "${messageData.name}" not found`,
				)
			} catch (err) {
				ErrorCatcher.instance.throw(err, true)
			}
		}

		return new Message({
			mapEmojiToBase64: {
				get: (name: string) => this.data.getEmojieData(name)?.base64,
			},
			messageData: {
				author: {
					name: messageData.name,
					texture: ((): Texture => {
						const url = avatar?.url
						if (typeof url === 'undefined') {
							return Texture.WHITE
						}
						return Texture.from(url)
					})(),
				},
				position:
					avatar?.position ??
					((): 'left' | 'right' => {
						const equalChance = 0.5
						if (Math.random() < equalChance) {
							return 'left'
						}
						return 'right'
					})(),
				text: messageData.text,
			},
			staticFunctions: getGrouppedStaticFunctions(preciseHelper),
			throwNotCritical: (err: unknown): void => {
				ErrorCatcher.instance.throw(err, true)
			},
		})
	}
}
