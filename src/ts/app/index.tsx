import { type FC, Suspense } from 'react'
import { ComponentGame } from './lazy-load-game.js'
import { ComponentLoading } from './loading.js'

export const ComponentApp: FC = () => (
	<Suspense fallback={<ComponentLoading />}>
		<ComponentGame />
	</Suspense>
)
