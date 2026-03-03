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
		const { firstInTopContainer, topChildInBottomContainer } =
			this.getInterestingCards()

		if (!topChildInBottomContainer) {
			return
		}

		if (!firstInTopContainer) {
			this.topContainer.addChild(topChildInBottomContainer)
			this.sortCards()
			return
		}

		if (
			topChildInBottomContainer.x + topChildInBottomContainer.width <=
			firstInTopContainer.x
		) {
			this.topContainer.addChild(topChildInBottomContainer)
			this.sortCards()
		}
	}

	protected getInterestingCards(): {
		firstInTopContainer: CardLike | undefined
		topChildInBottomContainer: CardLike | undefined
	} {
		const decrementForTopContainer = 1,
			indexInBottomContainer = 0

		return {
			firstInTopContainer:
				this.topContainer.children[
					this.topContainer.children.length - decrementForTopContainer
				],
			topChildInBottomContainer:
				this.bottomContainer.children[indexInBottomContainer],
		}
	}
}
