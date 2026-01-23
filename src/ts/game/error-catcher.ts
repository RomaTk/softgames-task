export class ErrorCatcher {
	protected static createdInstance?: ErrorCatcher

	public actionOnError?: () => void

	public static get instance(): ErrorCatcher {
		this.createdInstance ??= new ErrorCatcher()
		return this.createdInstance
	}

	public throw(err: unknown, isResolved: boolean): void {
		if (!isResolved) {
			if (this.actionOnError) {
				// It is the only place where we can output the error
				// eslint-disable-next-line no-console, no-undef
				console.error(err)
				this.actionOnError()
			} else {
				throw err
			}
			return
		}

		// It is the only place where we can output the error
		// eslint-disable-next-line no-console, no-undef
		console.warn(err)
	}
}
