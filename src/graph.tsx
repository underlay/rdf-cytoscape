import * as React from "react"
import cytoscape from "cytoscape"
import { processContext } from "jsonld"
import { compactIri } from "jsonld/lib/compact"
import { getInitialContext } from "jsonld/lib/context"

import { Store, Quad, Term, Literal, toId, IRIs } from "n3.ts"

import localCtx from "./context.json"

import Node from "./node"

import {
	encode,
	decode,
	Style,
	BreadthFirstLayout,
	GridLayout,
	CoseLayout,
	RandomLayout,
	DataURIPrefix,
	SVGPrefix,
} from "./utils"

interface GraphProps {
	store: Store
	graph: string
	focus?: string
	context?: {}
	onSelect?(focus: string): void
	onUnselect?(focus: string): void
	onMouseOver?(focus: string): void
	onMouseOut?(focus: string): void
	onMount?(cy: cytoscape.Core): void
	onDestroy?(): void
}

interface Node {
	index?: number
	literals: Map<string, Literal[]>
	types: string[]
}

function createNode(
	term: Term,
	nodes: Map<string, Node>,
	elements: cytoscape.ElementDefinition[]
) {
	const id = toId(term)
	if (!nodes.has(id)) {
		const node: Node = { literals: new Map(), types: [] }
		if (elements !== null) {
			node.index = elements.length
			const element: cytoscape.ElementDefinition = {
				group: "nodes",
				data: { id: encode(id) },
			}
			if (term.termType === "BlankNode") {
				element.classes = "blankNode"
			}
			elements.push(element)
		}
		nodes.set(id, node)
	}
}

function makeElements(
	activeCtx: {},
	quads: Quad[]
): cytoscape.ElementDefinition[] {
	const compact = (iri: string, vocab: boolean) => {
		try {
			return compactIri({ activeCtx, iri, relativeTo: { vocab: !!vocab } })
		} catch (e) {
			return iri
		}
	}

	const elements: cytoscape.ElementDefinition[] = []
	const nodes: Map<string, Node> = new Map()

	for (const [index, quad] of quads.entries()) {
		const {
			subject,
			predicate: { value: iri },
			object,
		} = quad

		const subjectId = toId(subject)
		const objectId = toId(object)

		createNode(subject, nodes, elements)
		if (object.termType === "Literal") {
			const { literals } = nodes.get(subjectId)
			if (literals.has(iri)) {
				literals.get(iri).push(object)
			} else {
				literals.set(iri, [object])
			}
		} else if (object.termType === "NamedNode" && iri === IRIs.rdf.type) {
			nodes.get(subjectId).types.push(objectId)
		} else {
			createNode(object, nodes, elements)
			elements.push({
				group: "edges",
				data: {
					id: encode(index.toString()),
					iri,
					name: compact(iri, true),
					source: encode(subjectId),
					target: encode(objectId),
				},
			})
		}
	}

	for (const [id, { literals, types, index }] of nodes.entries()) {
		const { data } = elements[index]
		if (id.startsWith("_:") && literals.size === 0 && types.length === 0) {
			data.width = 36
			data.height = 36
			data.empty = true
		} else {
			const [svg, width, height] = Node(id, types, literals, compact)
			data.svg = DataURIPrefix + encodeURIComponent(SVGPrefix + svg)
			data.width = width
			data.height = height
		}
	}

	return elements
}

const makeListener = (handler: (target: string) => void) => ({
	target,
}: cytoscape.EventObject) => handler(decode(target.id()))

function attachListeners(
	cy: cytoscape.Core,
	{ onSelect, onUnselect, onMouseOver, onMouseOut, focus, graph }: GraphProps
) {
	const n = cy.nodes()
	if (typeof onMouseOver === "function") {
		n.on("mouseover", makeListener(onMouseOver))
	}

	if (typeof onMouseOut === "function") {
		n.on("mouseout", makeListener(onMouseOut))
		cy.on("mouseout", (_) => onMouseOut(null))
	}

	if (typeof onSelect === "function") {
		n.on("select", ({ target }: cytoscape.EventObject) => {
			const id = decode(target.id())
			onSelect(id)
		})
	}

	if (typeof onUnselect === "function") {
		n.on("unselect", ({ target }: cytoscape.EventObject) => {
			const id = decode(target.id())
			onUnselect(id)
		})
	}

	if (focus === graph) {
		cy.container().parentElement.classList.add("selected")
	} else if (typeof focus === "string" && focus !== null && focus !== "") {
		cy.$(`#${encode(focus)}`).select()
	}
}

function makeEvents(
	cy: cytoscape.Core
): {
	[name: string]: (_: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
} {
	return {
		reset: (_) => cy.fit(),
		bfs: (_) => cy.layout(BreadthFirstLayout).run(),
		grid: () => cy.layout(GridLayout).run(),
		random: () => cy.layout(RandomLayout).run(),
		cose: () => cy.layout(CoseLayout).run(),
	}
}

const activeCtx = getInitialContext({ base: "" })

async function getCtx(context?: {}): Promise<{}> {
	return context === undefined
		? processContext(activeCtx, localCtx, {})
		: processContext(activeCtx, context, {})
}

export default function (props: GraphProps) {
	const { store: store, graph, focus, context, onMount, onDestroy } = props
	const [ctx, setCtx] = React.useState(null as {})
	React.useEffect(() => {
		getCtx(context)
			.then(setCtx)
			.catch((err) => console.error(err))
	}, [context])

	const quads = React.useMemo(() => store.getQuads(null, null, null, graph), [
		store,
		graph,
	])

	const elements = React.useMemo(
		() => (ctx === null ? null : makeElements(ctx, quads)),
		[ctx, quads]
	)

	const [cy, setCy] = React.useState(null as cytoscape.Core)

	React.useEffect(() => {
		if (elements !== null && cy !== null) {
			cy.batch(() => {
				cy.elements().remove()
				cy.add(elements)
			})

			cy.layout(BreadthFirstLayout).run()

			attachListeners(cy, props)
		}
	}, [elements, cy])

	const attachRef = React.useCallback(
		(container: HTMLDivElement) => {
			// Neither of these should really happen?
			if (container === null) {
				return
			} else if (cy !== null) {
				return
			}

			const nextCy = cytoscape({
				container,
				style: Style,
				minZoom: 0.2,
				maxZoom: 2,
				zoom: 1,
			})

			if (typeof onDestroy === "function") {
				nextCy.on("destroy", (_) => onDestroy())
			}

			if (typeof onMount === "function") {
				onMount(nextCy)
			}

			setCy(nextCy)
		},
		[focus, graph]
	)

	const events = React.useMemo(() => (cy === null ? {} : makeEvents(cy)), [cy])

	if (ctx === null) {
		return null
	}

	const className = graph === "" ? "graph default" : "graph"
	return (
		<div className={className}>
			<div className="control">
				{graph.startsWith("_:") ? null : <span>{graph}</span>}
				<button onClick={events.random}>Random</button>
				<button onClick={events.grid}>Grid</button>
				<button onClick={events.bfs}>BFS</button>
				<button onClick={events.cose}>Cose</button>|
				<button onClick={events.reset}>Reset</button>
			</div>
			<div className="container" ref={attachRef} />
		</div>
	)
}
