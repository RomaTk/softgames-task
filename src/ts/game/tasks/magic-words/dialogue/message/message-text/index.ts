import { LayoutContainer, LayoutSprite } from '@pixi/layout/components'
import { measureHtmlText, type HTMLText } from 'pixi.js'
import { getPreciseHTMLTextWidth } from './size-helper.js'

export type BatchableHTMLTextLike<HTMLTextLike extends HTMLText> =
	HTMLTextLike['_gpuData'][number]

// This is a specific class to wrap HTMLText to be used in layout container
// There are problems with using HTMLText directly in layout container because of the way layout plugin calculates space for the text + HTMLText rendering flow
export class MessageText<
	HTMLTextLike extends HTMLText,
> extends LayoutContainer {
	// Used to set layout space for the text
	protected readonly space: LayoutSprite
	// The actual text message
	protected readonly text: HTMLTextLike
	protected readonly defaultWidth: number

	public constructor(text: HTMLTextLike) {
		super()
		this.text = text
		this.defaultWidth = this.text.width
		this.space = new LayoutSprite({
			layout: {
				height: 20,
				maxWidth: '100%',
				width: Math.ceil(this.defaultWidth),
			},
		})
		this.addChild(this.space)
		this.addChild(this.text)
		this.resize()
	}

	public resize(): void {
		this.space.onRender = (): void => {
			this.space.onRender = null
			this.space.onLayout = (): void => {
				// @ts-expect-error - in types it requires function, but actually it can be null (what is better)
				this.space.onLayout = null
				const batchableHTMLText = this.getBatchableHTMLOfMessageText(),
					defaultPosition = { [`x`]: 0, [`y`]: 0 }
				this.text.position = {
					[`x`]: this.space.layout?.realX ?? defaultPosition.x,
					[`y`]: this.space.layout?.realY ?? defaultPosition.y,
				}
				if (!batchableHTMLText) {
					// Don`t know how to handle this case properly
					throw new Error('Batchable HTMLText data is not available')
				}
				batchableHTMLText.texturePromise
					.then(() => {
						if (this.space.width >= this.defaultWidth) {
							this.text.style.wordWrap = false
						} else {
							this.text.style.wordWrap = true
							this.text.style.wordWrapWidth = Math.floor(
								this.space.width,
							)
							this.space.layout = {
								width: Math.ceil(
									getPreciseHTMLTextWidth(this.text),
								),
							}
						}
						this.space.layout = {
							height: this.text.height,
						}
					})
					.catch((err: unknown) => {
						throw err
					})
			}
			this.space.layout?.forceUpdate()
		}
	}

	protected getBatchableHTMLOfMessageText(): BatchableHTMLTextLike<HTMLTextLike> | null {
		const gpuData = ((): HTMLTextLike['_gpuData'] => {
				const key = '_gpuData'
				return this.text[key]
			})(),
			interestingIndex = 0

		return ((): BatchableHTMLTextLike<HTMLTextLike> | null => {
			const batchableHTMLText:
				| BatchableHTMLTextLike<HTMLTextLike>
				| undefined = gpuData[interestingIndex]
			if (typeof batchableHTMLText === 'undefined') {
				return null
			}
			return batchableHTMLText
		})()
	}
}
