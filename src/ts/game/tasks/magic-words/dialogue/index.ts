import { LayoutContainer, ScrollSpring } from '@pixi/layout/components'
import type { Data as DataFromEndpoint } from '../data.js'
import { ErrorCatcher } from '../../../error-catcher.js'
import { Message } from './message/index.js'
import { staticFunctions } from './message/static-functions.js'
import { Texture } from 'pixi.js'

export type TMessage = Message<
	ReturnType<typeof staticFunctions.generateViewObject>,
	ReturnType<typeof staticFunctions.generateMessageContainer>,
	ReturnType<typeof staticFunctions.generateAuthorName>,
	ReturnType<typeof staticFunctions.generateMessageText>,
	ReturnType<typeof staticFunctions.generateAvatar>,
	ReturnType<typeof staticFunctions.generateCornerRect>,
	Texture
>

// Take into account that this class can be used only after initialization of application with layout plugin
export class Dialogue<Data extends DataFromEndpoint> {
	public readonly viewObject: LayoutContainer
	protected readonly data: Data
	protected readonly messages: readonly TMessage[]
	protected readonly scrollSpring: ScrollSpring

	public constructor(data: Data) {
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
		this.viewObject.addChild(
			...this.messages.map(
				(msg: { readonly viewObject: LayoutContainer }) =>
					msg.viewObject,
			),
		)
	}

	public resize(width: number, height: number): void {
		this.viewObject.layout = {
			height,
			width,
		}
		this.messages.forEach(
			(message: {
				readonly resize: (width: number, height: number) => void
			}) => {
				message.resize(width, height)
			},
		)
	}

	public async display(): Promise<void> {
		// HACK Here alpha is used as hack (look more in message (wrap + layout problem) )
		this.viewObject.alpha = 0.001
		this.viewObject.layout = {
			display: 'flex',
			flexDirection: 'column',
		}

		this.viewObject.alpha = 1
	}

	public destroy(): void {
		this.messages.forEach((message: { readonly destroy: () => void }) => {
			message.destroy()
		})
		this.viewObject.destroy(true)
	}

	protected createMessages(): TMessage[] {
		const messages: TMessage[] = []
		for (const messageData of this.data.dialogue) {
			messages.push(this.createMessage(messageData))
		}
		window.messages = messages
		return messages
	}

	protected createMapOfEmojis(): ReadonlyMap<string, string> {
		const emojiesMap = new Map<string, string>()
		this.data.emojies.forEach(
			(data: {
				readonly name: string
				readonly base64?: string | undefined
			}) => {
				if (typeof data.base64 === 'undefined') {
					return
				}
				emojiesMap.set(data.name, data.base64)
			},
		)
		return emojiesMap
	}

	// eslint-disable-next-line max-lines-per-function
	protected createMessage(messageData: {
		readonly name: string
		readonly text: string
	}): TMessage {
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
			})(),
			mapEmojiToBase64 = this.createMapOfEmojis()

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
			mapEmojiToBase64,
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
			staticFunctions,
			throwNotCritical: (err: unknown): void => {
				ErrorCatcher.instance.throw(err, true)
			},
		})
	}
}
