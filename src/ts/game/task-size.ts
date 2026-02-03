// Used to forward size from outside to the task
export class TaskSize {
	protected readonly getHeight: () => number
	protected readonly getWidth: () => number

	public constructor(getHeight: () => number, getWidth: () => number) {
		this.getHeight = getHeight
		this.getWidth = getWidth
	}

	public get height(): number {
		return this.getHeight()
	}

	public get width(): number {
		return this.getWidth()
	}
}
