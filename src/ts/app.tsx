import { type FC, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

export const App: FC = () => <div>{'Hello, world!'}</div>

document.addEventListener('DOMContentLoaded', () => {
	createRoot(document.body).render(
		<StrictMode>
			<App />
		</StrictMode>,
	)
})
