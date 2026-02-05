import type { HTMLText, Texture } from 'pixi.js'
import type { TPreciseSizeHelper } from '../message-text/index.js'
import type { TStaticFunctions } from '../index.js'
import { create as creatAvatar } from './avatar.js'
import { create as createAuthorName } from './author-name.js'
import { create as createCornerRect } from './corner-rect.js'
import { create as createHtmlTextWithImages } from './text-with-images.js'
import { create as createMessageContainer } from './message-container.js'
import { create as createMessageText } from './message-text.js'
import { create as createViewObject } from './view-object.js'

export type TDefaultStaticFunctions<
	PSizeHelperLike extends TPreciseSizeHelper<HTMLText>,
> = TStaticFunctions<
	ReturnType<typeof createViewObject>,
	ReturnType<typeof createAuthorName>,
	ReturnType<typeof createMessageText<PSizeHelperLike>>,
	ReturnType<typeof creatAvatar>,
	ReturnType<typeof createCornerRect>,
	ReturnType<typeof createMessageContainer>,
	Texture
>

// If styles are not going to be changed or objects extended - we can use a single instance of static functions or this rulles can be used for testing purposes
export const getGrouppedStaticFunctions = <
	PSizeHelperLike extends TPreciseSizeHelper<HTMLText>,
>(
	precisedSizeHelper: PSizeHelperLike,
): TDefaultStaticFunctions<PSizeHelperLike> => ({
	create: {
		authorName: createAuthorName,
		avatar: creatAvatar,
		cornerRect: createCornerRect,
		messageContainer: createMessageContainer,
		messageText: (text: string) =>
			createMessageText(text, precisedSizeHelper),
		viewObject: createViewObject,
	},
	getHtmlTextWithImages: createHtmlTextWithImages,
})
