import { PreciseSizeHelperCache } from './components/message/message-text/precise-size-helper/cache.js'
import { PreciseSizeHelper as PreciseSizeHelperComponent } from './components/message/message-text/precise-size-helper/index.js'
import { styleContentParser } from './components/message/message-text/precise-size-helper/style-content-parser.js'

export class PreciseSizeHelper extends PreciseSizeHelperComponent<
	PreciseSizeHelperCache<DOMRect>
> {
	public constructor(maxSizeCache: number) {
		super(
			styleContentParser,
			new PreciseSizeHelperCache<DOMRect>(maxSizeCache),
		)
	}
}
