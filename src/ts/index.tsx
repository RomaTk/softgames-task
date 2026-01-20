import { ComponentApp } from './app/index.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const createRootApp = (): void => {
	createRoot(document.body).render(
		<StrictMode>
			<ComponentApp />
		</StrictMode>,
	)
}

if (document.readyState === 'loading') {
	document.addEventListener(
		'DOMContentLoaded',
		() => {
			createRootApp()
		},
		{ once: true },
	)
} else {
	createRootApp()
}
