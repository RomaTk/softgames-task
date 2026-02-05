import { MessageText, type TPreciseSizeHelper } from '../message-text/index.js'
import { HTMLText } from 'pixi.js'

export const create = <PSizeHelperLike extends TPreciseSizeHelper<HTMLText>>(
	text: string,
	presiseSizeHelper: PSizeHelperLike,
): MessageText<HTMLText, PSizeHelperLike> =>
	new MessageText<HTMLText, PSizeHelperLike>(
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
