import {
	LayoutContainer,
	LayoutHTMLText,
	LayoutSprite,
	LayoutText,
} from '@pixi/layout/components'
import { Graphics, Texture } from 'pixi.js'
import { TSizeHelper, TSizeHelpers } from './index.js'
import { generateHtmlTextWithImages } from './text-with-images.js'

export const staticFunctions = {
	generateAuthorName: (name: string): LayoutText => {
		const object = new LayoutText({
			style: {
				fill: '#ffb300',
				fontFamily: 'Arial',
				fontSize: 26,
				fontWeight: 'bold',
				stroke: '#a67c00',
			},
			text: name,
		})
		object.layout = {
			height: object.height,
			maxWidth: object.width,
		}
		return object
	},
	generateViewObject: (position: 'left' | 'right'): LayoutContainer =>
		new LayoutContainer({
			layout: {
				alignSelf: ((): 'flex-start' | 'flex-end' => {
					if (position === 'left') {
						return 'flex-start'
					}
					return 'flex-end'
				})(),
				display: 'flex',
				flexDirection: ((): 'row' | 'row-reverse' => {
					if (position === 'left') {
						return 'row'
					}
					return 'row-reverse'
				})(),
				flexShrink: 0,
				marginTop: 10,
				width: '75%',
			},
		}),
	generateMessageText: (isWordWrap: boolean, text: string): LayoutHTMLText =>
		new LayoutHTMLText({
			style: {
				fill: '#3495eb',
				fontFamily: 'Arial',
				fontSize: 22,
				fontWeight: 'bold',
				padding: 6,
				stroke: '#1a4e7a',
				wordWrap: isWordWrap,
			},
			text,
			layout: {
				maxWidth: '100%',
			},
		}),
	generateAvatar: (texture: Texture): LayoutSprite =>
		new LayoutSprite({
			layout: {
				alignSelf: 'flex-end',
				aspectRatio: 1,
				maxHeight: '50%',
				objectFit: 'cover',
				width: 100,
			},
			texture,
		}),
	generateCornerRect: (position: 'left' | 'right'): Graphics => {
		const cornerRect = new Graphics({
			layout: {
				position: 'absolute',
				...((): { right?: number; left?: number } => {
					if (position === 'left') {
						return { left: 0 }
					}
					return { right: 0 }
				})(),
				bottom: 0,
				height: '50%',
				objectFit: 'fill',
				width: '50%',
			},
		})
		// Func to write rectangle
		return ((): Graphics => {
			const bounds = {
					height: 20,
					width: 20,
					xPos: 0,
					yPos: 0,
				},
				color = 0x4a148c
			return cornerRect
				.rect(bounds.xPos, bounds.yPos, bounds.width, bounds.height)
				.fill(color)
		})()
	},
	generateMessageContainer: (): LayoutContainer =>
		new LayoutContainer({
			layout: {
				alignItems: 'flex-start',
				backgroundColor: 0x4a148c,
				borderRadius: 10,
				display: 'flex',
				flexDirection: 'column',
				gap: 5,
				marginBottom: 10,
				maxWidth: '100%',
				objectFit: 'fill',
				padding: 10,
			},
		}),
	getSizeHelpers: (
		authorName: string,
		messageText: string,
	): TSizeHelpers => ({
		authorName: ((): TSizeHelper => {
			const object = staticFunctions.generateAuthorName(authorName)
			return ((): TSizeHelper => {
				const toReturn = {
					height: object.height,
					width: object.width,
				}
				object.destroy(true)
				return toReturn
			})()
		})(),
		message: ((): TSizeHelper => {
			const object = staticFunctions.generateMessageText(
				false,
				messageText,
			)
			return ((): TSizeHelper => {
				const toReturn = {
					height: object.height,
					width: object.width,
				}
				object.destroy(true)
				return toReturn
			})()
		})(),
	}),
	generateHtmlTextWithImages,
}
