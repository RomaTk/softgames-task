import { Ticker } from 'pixi.js'

export class OnTickResizeObserver extends ResizeObserver {
	protected isUpdateWasMade: boolean
	protected readonly onTickCallback: () => void

	public constructor(callback: () => void) {
		super(() => {
			if (this.isUpdateWasMade) {
				return
			}
			this.isUpdateWasMade = true
			Ticker.shared.addOnce(this.onTickCallback)
		})
		this.isUpdateWasMade = false
		this.onTickCallback = (): void => {
			try {
				this.isUpdateWasMade = false
				callback()
			} catch (err: unknown) {
				console.error(err)
			}
		}
	}

	public override disconnect(): void {
		super.disconnect()
		Ticker.shared.remove(this.onTickCallback)
	}
}
