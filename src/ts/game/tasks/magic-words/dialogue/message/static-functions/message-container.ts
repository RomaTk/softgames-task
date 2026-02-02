import { LayoutContainer } from '@pixi/layout/components'

export const create = (): LayoutContainer =>
	new LayoutContainer({
		layout: {
			alignItems: 'flex-start',
			backgroundColor: 0x4a148c,
			borderRadius: 10,
			display: 'flex',
			flexDirection: 'column',
			gap: 5,
			marginBottom: 10,
			maxWidth: '90%',
			objectFit: 'fill',
			padding: 10,
		},
	})
