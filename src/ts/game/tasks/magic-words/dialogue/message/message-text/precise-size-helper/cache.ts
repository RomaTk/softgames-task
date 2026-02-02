const minSizeOfArray = 0

// It is used to cache boundingClientRects of HTMLText elements (to avoid creating them again and again) - very helpful for rotating devices etc.
export class PreciseSizeHelperCache<DomRectLike extends object> {
	protected maxDomRects: number
	protected readonly boundingClientRects: {
		// AKA Map<"textContent", Map<"cssStyle", DOMRect>> - cached bounding rects
		readonly toFind: Map<string, Map<string, DomRectLike>>
		readonly toClean: {
			readonly byTimeCreated: DomRectLike[]
			readonly savedProperties: WeakMap<
				DomRectLike,
				{
					readonly text: string
					readonly cssStyle: string
				}
			>
		}
	}

	public constructor(maxSize: number) {
		if (maxSize < minSizeOfArray) {
			throw new Error('maxSize must be greater or equal to 0')
		}
		this.maxDomRects = maxSize

		this.boundingClientRects = {
			toClean: {
				byTimeCreated: [],
				savedProperties: new WeakMap(),
			},
			toFind: new Map(),
		}
	}

	public get maxSize(): number {
		return this.maxDomRects
	}

	public set maxSize(value: number) {
		if (value < minSizeOfArray) {
			throw new Error('maxSize must be greater or equal to 0')
		}
		const wasMaxDomRects = this.maxDomRects
		this.maxDomRects = value

		// Clean cache if needed
		if (wasMaxDomRects <= this.maxDomRects) {
			return
		}
		this.cleanDueToLimit()
	}

	public clear(): void {
		this.boundingClientRects.toFind.clear()
		// Cleans byTimeCreated and savedProperties
		this.boundingClientRects.toClean.byTimeCreated
			.splice(
				minSizeOfArray,
				this.boundingClientRects.toClean.byTimeCreated.length,
			)
			.forEach((rect) => {
				this.boundingClientRects.toClean.savedProperties.delete(rect)
			})
	}

	public add(text: string, cssStyle: string, rect: DomRectLike): void {
		const current = this.get(text, cssStyle)

		if (current) {
			throw new Error(
				'PreciseSizeHelperCache: trying to add already existing DOMRect (problem with working with cache)',
			)
		}

		if (!this.boundingClientRects.toFind.get(text)?.set(cssStyle, rect)) {
			this.boundingClientRects.toFind.set(
				text,
				new Map([[cssStyle, rect]]),
			)
			this.boundingClientRects.toClean.byTimeCreated.push(rect)
			this.boundingClientRects.toClean.savedProperties.set(rect, {
				cssStyle,
				text,
			})
			this.cleanDueToLimit()
		}
	}

	public get(text: string, cssStyle: string): DomRectLike | undefined {
		return this.boundingClientRects.toFind.get(text)?.get(cssStyle)
	}

	protected cleanDueToLimit(): void {
		const excess =
			this.boundingClientRects.toClean.byTimeCreated.length -
			this.maxDomRects

		if (excess <= minSizeOfArray) {
			return
		}

		this.boundingClientRects.toClean.byTimeCreated
			.splice(minSizeOfArray, excess)
			.forEach((rect) => {
				this.cleanCache(rect)
			})
	}

	protected cleanCache(rect: DomRectLike): void {
		const properties =
			this.boundingClientRects.toClean.savedProperties.get(rect)
		if (!properties) {
			throw new Error(
				'Inconsistent state in PreciseSizeHelper boundingClientRects (toClean)',
			)
		}
		this.cleanCacheToFind(properties)
		this.boundingClientRects.toClean.savedProperties.delete(rect)
	}

	protected cleanCacheToFind(properties: {
		readonly text: string
		readonly cssStyle: string
	}): void {
		const byTextMap = this.boundingClientRects.toFind.get(properties.text)
		if (!byTextMap) {
			throw new Error(
				'Inconsistent state in PreciseSizeHelper boundingClientRects (toFind)',
			)
		}
		byTextMap.delete(properties.cssStyle)
		if (!byTextMap.size) {
			this.boundingClientRects.toFind.delete(properties.text)
		}
	}
}
