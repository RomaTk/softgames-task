import { HTMLText } from 'pixi.js'

export const getPreciseHTMLTextWidth = (htmlTextInstance: HTMLText) => {
	const text = htmlTextInstance.text
	const style = htmlTextInstance.style.cssStyle
	const styleContent = htmlTextInstance.style.cssStyle.replace(
		/^[^{]*{\s*|\s*}[^}]*$/g,
		'',
	)
	console.log('Style content:', styleContent)
	const div = document.createElement('div')
	div.style.cssText = styleContent

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
