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
	protected readonly parsedData: z.infer<(typeof Data)['dataSchema']>

	public constructor(input: unknown) {
		this.parsedData = Data.parseData(input)
	}

	public get emojies(): readonly z.infer<
		(typeof Data)['dataSchema']
	>['emojies'][number][] {
		return this.parsedData.emojies
	}

	public get dialogue(): readonly z.infer<
		(typeof Data)['dataSchema']
	>['dialogue'][number][] {
		return this.parsedData.dialogue
	}

	public get avatars(): readonly z.infer<
		(typeof Data)['dataSchema']
	>['avatars'][number][] {
		return this.parsedData.avatars
	}

	protected static parseData(
		data: unknown,
	): z.infer<(typeof Data)['dataSchema']> {
		return this.dataSchema.parse(data)
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
}
