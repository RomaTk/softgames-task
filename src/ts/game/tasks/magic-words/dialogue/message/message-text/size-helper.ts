/* eslint-disable max-statements */
import { HTMLText } from 'pixi.js'

export const getPreciseHTMLTextWidth = (
	htmlTextInstance: HTMLText,
	wordWrapWidth: number,
) => {
	const text = htmlTextInstance.text
	const style = htmlTextInstance.style.cssStyle
	const styleContent = style.replace(/^[^{]*{\s*|\s*}[^}]*$/g, '')
	const div = document.createElement('div')
	div.style.cssText = styleContent
	div.style.maxWidth = `${wordWrapWidth}px`

	div.style.position = 'absolute'
	div.style.visibility = 'hidden'
	div.style.pointerEvents = 'none'

	div.style.width = 'fit-content'
	div.style.height = 'auto'

	// 4. Insert the HTML
	div.innerHTML = text
	document.body.appendChild(div)

	const range = document.createRange()
	range.selectNodeContents(div)
	const rect = range.getBoundingClientRect()

	// 6. Cleanup
	document.body.removeChild(div)

	return rect.width
}
