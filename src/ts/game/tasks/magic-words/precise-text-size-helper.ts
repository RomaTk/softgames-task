import { PreciseSizeHelper } from './components/message/message-text/precise-size-helper/index.js'
import { PreciseSizeHelperCache } from './components/message/message-text/precise-size-helper/cache.js'
import { styleContentParser } from './components/message/message-text/precise-size-helper/style-content-parser.js'

export const preciseSizeHelper = new PreciseSizeHelper(
	styleContentParser,
	new PreciseSizeHelperCache<DOMRect>(10),
)
