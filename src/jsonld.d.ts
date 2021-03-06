declare module "jsonld/lib/compact" {
	function compactIri(options: {
		activeCtx: {}
		iri: string
		relativeTo: { vocab: boolean }
	}): string
}

declare module "jsonld/lib/context" {
	function getInitialContext(options: { base: string }): {}
}

declare module "jsonld" {
	function processContext(activeCtx: {}, localCtx: {}, options: {}): Promise<{}>
}
