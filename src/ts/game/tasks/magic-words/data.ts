import { z } from 'zod'

export class Data {
	protected static readonly dataSchema = z.object({
		avatars: z.array(
			z.object({
				name: z.string(),
				position: z
					.string()
					.refine((val) => val === 'left' || val === 'right'),
				url: z.string(),
			}),
		),
		dialogue: z.array(
			z.object({
				name: z.string(),
				text: z.string(),
			}),
		),
		emojies: z.array(
			z.object({
				base64: z.optional(z.string()),
				name: z.string(),
				url: z.string(),
			}),
		),
	})

	protected readonly emojieMap: Map<
		string,
		z.infer<(typeof Data)['dataSchema']>['emojies'][number]
	>
	protected readonly parsedData: z.infer<(typeof Data)['dataSchema']>

	public constructor(input: unknown) {
		this.parsedData = Data.parseData(input)
		this.emojieMap = this.createEmojieMap()
	}

	public get emojies(): Readonly<
		z.infer<(typeof Data)['dataSchema']>['emojies']
	> {
		return this.parsedData.emojies
	}

	public get dialogue(): Readonly<
		z.infer<(typeof Data)['dataSchema']>['dialogue']
	> {
		return this.parsedData.dialogue
	}

	public get avatars(): Readonly<
		z.infer<(typeof Data)['dataSchema']>['avatars']
	> {
		return this.parsedData.avatars
	}

	protected static parseData(
		data: unknown,
	): z.infer<(typeof Data)['dataSchema']> {
		return this.dataSchema.parse(data)
	}

	public getEmojieData(
		name: string,
	):
		| Readonly<z.infer<(typeof Data)['dataSchema']>['emojies'][number]>
		| undefined {
		return this.emojieMap.get(name)
	}

	public addBase64ToEmoji(name: string, base64Data: string): void {
		const emoji = this.parsedData.emojies.find(
			(em: { readonly name: string }) => em.name === name,
		)
		if (!emoji) {
			throw new Error(`Emoji with name ${name} not found`)
		}
		emoji.base64 = base64Data
	}

	protected createEmojieMap(): Map<
		z.infer<(typeof Data)['dataSchema']>['emojies'][number]['name'],
		z.infer<(typeof Data)['dataSchema']>['emojies'][number]
	> {
		return new Map<
			z.infer<(typeof Data)['dataSchema']>['emojies'][number]['name'],
			z.infer<(typeof Data)['dataSchema']>['emojies'][number]
		>(
			this.parsedData.emojies.map(
				(data: {
					readonly name: string
					readonly url: string
					readonly base64?: string | undefined
				}) => [data.name, data],
			),
		)
	}
}
