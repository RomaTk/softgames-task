import { Text, Ticker } from 'pixi.js'

export class FPSMeter extends Text {
	protected updateFpsFunc: () => void
	public constructor() {
		super({
			style: {
				fill: '#ffffff',
				fontSize: 14,
			},
			text: 'FPS: 0',
		})
		this.updateFpsFunc = (): void => {
			this.updateFPS()
		}
		Ticker.shared.add(this.updateFpsFunc)
	}

	public override destroy(): void {
		Ticker.shared.remove(this.updateFpsFunc)
		super.destroy(true)
	}

	protected updateFPS(): void {
		this.text = `FPS: ${Math.round(Ticker.shared.FPS)}`
	}
}
