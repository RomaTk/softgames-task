import { LayoutText } from '@pixi/layout/components'

export const create = (name: string): LayoutText => {
	const object = new LayoutText({
		style: {
			fill: '#ffb300',
			fontFamily: 'Arial',
			fontSize: 26,
			fontWeight: 'bold',
			stroke: '#a67c00',
		},
		text: name,
	})
	object.layout = {
		height: object.height,
		maxWidth: object.width,
	}
	return object
}
