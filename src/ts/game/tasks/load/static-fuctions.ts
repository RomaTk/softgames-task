import { Container, Graphics } from 'pixi.js'
import { type TCore, type TSpinner, TickerCallBack } from './ticker-callback.js'

export const staticFunctions = {
	createCore: (): Graphics => {
		const color = 0x7dd3fc,
			core = new Graphics(),
			coreRadius = 8,
			generalStartPosition = 0
		core.circle(generalStartPosition, generalStartPosition, coreRadius)
		core.fill(color)
		return core
	},
	createSpinner: (): Graphics => {
		const endAngleMultiplier = 1.5,
			generalStartPosition = 0,
			radius = 40,
			spinner = new Graphics(),
			strokeWidth = 5

		spinner.arc(
			generalStartPosition,
			generalStartPosition,
			radius,
			generalStartPosition,
			Math.PI * endAngleMultiplier,
		)
		spinner.stroke({
			cap: 'round',
			color: 0x38bdf8,
			width: strokeWidth,
		})
		return spinner
	},
	createTickFunction: <SpinnerLike extends TSpinner, CoreLike extends TCore>(
		spinner: SpinnerLike,
		core: CoreLike,
	): TickerCallBack<SpinnerLike, CoreLike>['tickCallback'] =>
		new TickerCallBack<SpinnerLike, CoreLike>(spinner, core).tickCallback,
	createViewObject: (): Container => new Container(),
}
