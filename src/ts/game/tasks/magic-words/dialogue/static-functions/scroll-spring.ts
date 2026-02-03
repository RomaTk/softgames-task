import { ScrollSpring } from '@pixi/layout/components'

export const create = (): ScrollSpring =>
	new ScrollSpring({
		damp: 0.7,
		max: 200,
		springiness: 0.15,
	})
