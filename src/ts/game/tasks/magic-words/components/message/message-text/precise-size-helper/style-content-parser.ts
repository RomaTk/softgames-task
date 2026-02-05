export const styleContentParser = (style: string): string =>
	style.replace(/^[^\\{]*\{\s*|\s*\}[^\\}]*$/gu, '')
