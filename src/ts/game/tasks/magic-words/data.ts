import { z } from 'zod'

export class Data {
	protected static readonly dataSchema = z.object({
		avatars: z.array(
			z.object({
				name: z.string(),
				position: z.string(),
				url: z.string(),
			}),
		),
		dialogue: z.array(
			z.object({
				name: z.string(),
				text: z.string(),
			}),
		),
		emojies: z.array(z.object({ name: z.string(), url: z.string() })),
	})
	// So can be changed in subclasses
	protected static: typeof Data
	protected parsedData?: z.infer<(typeof Data)['dataSchema']>

	public constructor() {
		this.static = Data
	}

	public get emojies(): readonly z.infer<
		(typeof Data)['dataSchema']
	>['emojies'][number][] {
		if (!this.parsedData) {
			throw new Error('Data not parsed yet')
		}
		return this.parsedData.emojies
	}

	public get avatars(): readonly z.infer<
		(typeof Data)['dataSchema']
	>['avatars'][number][] {
		if (!this.parsedData) {
			throw new Error('Data not parsed yet')
		}
		return this.parsedData.avatars
	}

	protected static parseData(
		data: unknown,
	): z.infer<(typeof Data)['dataSchema']> {
		try {
			return this.dataSchema.parse(data)
		} catch (err: unknown) {
			console.error('Data parsing error:', err)
			throw err
		}
	}

	public parse(data: unknown): void {
		this.parsedData = this.static.parseData(data)
	}
}
