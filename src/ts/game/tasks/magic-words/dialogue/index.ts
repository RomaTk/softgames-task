import { LayoutContainer, ScrollSpring } from '@pixi/layout/components'
import type { Data as DataFromEndpoint } from '../data.js'
import { Message } from './message.js'

// Take into account that this class can be used only after initialization of application with layout plugin
export class Dialogue<Data extends DataFromEndpoint> {
	public readonly viewObject: LayoutContainer
	protected readonly data: Data
	protected readonly messages: readonly Message[]
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
				// TODO remove
				xEase: new ScrollSpring({
					damp: 0.7,
					max: 200,
					springiness: 0.15,
				}),
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

	public display(): void {
		this.viewObject.layout = {
			display: 'flex',
			flexDirection: 'column',
		}
	}

	public destroy(): void {
		this.messages.forEach((message: { readonly destroy: () => void }) => {
			message.destroy()
		})
		this.viewObject.destroy(true)
	}

	protected createMessages(): Message[] {
		const messages: Message[] = []
		for (const messageData of this.data.dialogue) {
			messages.push(this.createMessage(messageData))
		}
		return messages
	}

	protected createMessage(messageData: {
		readonly name: string
		readonly text: string
	}): Message {
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
				console.warn(err)
			}
		}

		return new Message({
			author: {
				avatarUrl: avatar?.url ?? '',
				name: messageData.name,
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
		})
	}
}
