import { MessageText, type TPreciseSizeHelper } from '../message-text/index.js'
import { HTMLText } from 'pixi.js'

export const create = (
	text: string,
	presiseSizeHelper: TPreciseSizeHelper<HTMLText>,
): MessageText<HTMLText, TPreciseSizeHelper<HTMLText>> =>
	new MessageText<HTMLText, TPreciseSizeHelper<HTMLText>>(
		new HTMLText({
			style: {
				fill: '#3495eb',
				fontFamily: 'Arial',
				fontSize: 22,
				fontWeight: 'bold',
				padding: 6,
				stroke: '#1a4e7a',
				wordWrap: false,
			},
			text,
		}),
		presiseSizeHelper,
	)
