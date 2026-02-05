import { type ConstrainEase, LayoutContainer } from '@pixi/layout/components'

export const create = (
	scrollSpring: Readonly<ConstrainEase>,
): LayoutContainer =>
	new LayoutContainer({
		layout: {
			display: 'flex',
			flexDirection: 'column',
			overflow: 'scroll',
		},
		trackpad: {
			constrain: true,
			disableEasing: false,
			maxSpeed: 400,
			yEase: scrollSpring,
		},
	})
