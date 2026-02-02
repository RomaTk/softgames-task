export type THtmlText = {
	readonly text: string
	readonly style: {
		readonly cssStyle: string
	}
}

export type TCache<DomRectLike> = {
	readonly add: (text: string, cssStyle: string, rect: DomRectLike) => void
	readonly get: (text: string, cssStyle: string) => DomRectLike | undefined
}

export class PreciseSizeHelper<CacheLike extends TCache<DOMRect>> {
	protected readonly cache: CacheLike
	// Used to remove like div {} from css style
	protected readonly styleContentParser: (style: string) => string

	public constructor(
		styleContentParser: (style: string) => string,
		cache: CacheLike,
	) {
		this.styleContentParser = styleContentParser
		this.cache = cache
	}

	public getBoundingClientRect(htmlText: THtmlText): DOMRect {
		const { cssStyle } = htmlText.style,
			{ text } = htmlText

		return (this.getOldBoundingRect({ cssStyle, text }).rect ??=
			((): DOMRect => {
				const rect = this.getNewBoundingRect(text, cssStyle)
				this.cache.add(text, cssStyle, rect)
				return rect
			})())
	}

	protected getOldBoundingRect<
		Props extends { readonly text: string; readonly cssStyle: string },
	>(properties: Props): Props & { rect?: DOMRect } {
		const found = this.cache.get(properties.text, properties.cssStyle)
		if (found) {
			return { ...properties, rect: found }
		}
		return properties
	}

	protected getNewBoundingRect(text: string, cssStyle: string): DOMRect {
		const div = this.getDiv(cssStyle, text),
			range = document.createRange()

		document.body.appendChild(div)
		range.selectNodeContents(div)
		return ((): DOMRect => {
			const rect = range.getBoundingClientRect()
			// Clean up
			document.body.removeChild(div)
			return rect
		})()
	}

	protected getDiv(style: string, text: string): HTMLDivElement {
		const div = document.createElement('div')
		div.style.cssText = this.styleContentParser(style)

		div.style.position = 'absolute'
		div.style.visibility = 'hidden'
		div.style.pointerEvents = 'none'

		div.style.width = 'fit-content'
		div.style.height = 'auto'

		div.innerHTML = text

		return div
	}
}
