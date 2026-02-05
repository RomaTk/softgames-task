import { LayoutContainer } from '@pixi/layout/components'

export const create = (position: 'left' | 'right'): LayoutContainer =>
	new LayoutContainer({
		layout: {
			alignItems: 'center',
			alignSelf: ((): 'flex-start' | 'flex-end' => {
				if (position === 'left') {
					return 'flex-start'
				}
				return 'flex-end'
			})(),
			display: 'flex',
			flexDirection: ((): 'row' | 'row-reverse' => {
				if (position === 'left') {
					return 'row'
				}
				return 'row-reverse'
			})(),
			flexShrink: 0,
			marginTop: 10,
			width: '75%',
		},
	})
