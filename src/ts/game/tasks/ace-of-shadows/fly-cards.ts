import { Container } from 'pixi.js'
import type { TCard } from './card.js'

export type TFlyCards<CardLike extends TCard> = {
	readonly addCard: (card: CardLike) => void
	readonly sortCards: () => void
} & Container<Container<CardLike>>

export class FlyCards<CardLike extends TCard> extends Container<
	Container<CardLike>
> {
	protected readonly bottomContainer: Container<CardLike>
	protected readonly topContainer: Container<CardLike>

	public constructor() {
		super()
		this.bottomContainer = new Container()
		this.topContainer = new Container()
		this.addChild(this.bottomContainer, this.topContainer)
	}

	public addCard(card: CardLike): void {
		const minIndex = 0
		this.bottomContainer.addChildAt(card, minIndex)
	}

	public override destroy(): void {
		this.bottomContainer.children.forEach((child) => {
			child.destroy()
		})
		this.topContainer.children.forEach((child) => {
			child.destroy()
		})
		this.bottomContainer.destroy()
		this.topContainer.destroy()
		super.destroy()
	}

	public sortCards(): void {
		if (
			!this.isAtleastTwoCardsFlying() ||
			!this.bottomContainer.children.length
		) {
			return
		}
		const ignoreIndex = ((): number => {
				const reduceFromLengthToLastIndex = 1
				return (
					this.bottomContainer.children.length -
					reduceFromLengthToLastIndex
				)
			})(),
			maxXs: number[] = []

		this.bottomContainer.children.forEach((child, index) => {
			if (index >= ignoreIndex) {
				return
			}
			// Ideally take real bounds, but it is too expensive, so we will just take the position and add the width
			maxXs.push(child.x + child.width)
		})

		this.sortTopCardInBottomContainer(ignoreIndex, maxXs)
	}

	protected sortTopCardInBottomContainer(
		topIndex: number,
		maxXs: readonly number[],
	): void {
		const firstInBottomContainer = this.bottomContainer.children[topIndex]

		if (!firstInBottomContainer) {
			return
		}

		if (firstInBottomContainer.x >= Math.max(...maxXs)) {
			this.topContainer.addChild(firstInBottomContainer)
		}
	}

	protected isAtleastTwoCardsFlying(): boolean {
		const twoCardsCount = 2
		return (
			this.bottomContainer.children.length +
				this.topContainer.children.length >=
			twoCardsCount
		)
	}
}
