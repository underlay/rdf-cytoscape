import * as React from "react"
import { N3Store } from "n3"
import PanelGroup, { PanelWidth } from "react-panelgroup"

import GraphView from "./graph"
import { encode, BorderColor, PanelWidths, decode } from "./utils"

export const Graph = GraphView

interface DatasetProps {
	context: {}
	store: N3Store
	focus?: string | null
	onFocus?(focus: string): void
}

export function Dataset({ store, context, focus, onFocus }: DatasetProps) {
	const cys: React.MutableRefObject<Map<string, cytoscape.Core>> = React.useRef(
		new Map()
	)

	const graphs = React.useMemo(() => {
		const graphs: string[] = []
		for (const { termType, id } of store.getGraphs(null, null, null)) {
			if (termType === "BlankNode") {
				graphs.push(id)
			}
		}

		return graphs
	}, [store])

	const focusRef = React.useRef(focus)

	React.useEffect(() => {
		focusRef.current = focus
	}, [focus])

	const handleInnerUpdate = React.useCallback(
		(_: PanelWidth) => {
			for (const graph of graphs) {
				if (cys.current.has(graph)) {
					cys.current.get(graph).resize()
				}
			}
		},
		[graphs]
	)

	const handleOuterUpdate = React.useCallback(
		(data: PanelWidth) => {
			handleInnerUpdate(data)
			if (cys.current.has("")) {
				cys.current.get("").resize()
			}
		},
		[handleInnerUpdate]
	)

	const handleMouseOver = React.useCallback((id: string) => {
		for (const [graph, cy] of cys.current.entries()) {
			if (id !== "") {
				cy.$("#" + encode(id)).addClass("hover")
			}

			if (id === graph) {
				cy.container().parentElement.classList.add("hover")
			}
		}
	}, [])

	const handleMouseOut = React.useCallback((id: string, graph: string) => {
		if (id === null) {
			const forEach = (ele: cytoscape.SingularElementReturnValue) => {
				const id = decode(ele.id())
				if (cys.current.has(id)) {
					cys.current
						.get(id)
						.container()
						.parentElement.classList.remove("hover")
				}
			}

			cys.current.get(graph).$(".hover").forEach(forEach).removeClass("hover")
		} else {
			for (const [graph, cy] of cys.current.entries()) {
				if (id !== "") {
					cy.$("#" + encode(id)).removeClass("hover")
				}

				if (id === graph) {
					cy.container().parentElement.classList.remove("hover")
				}
			}
		}
	}, [])

	const handleSelect = React.useCallback((id: string) => {
		if (id !== focusRef.current) {
			const f = encode(id)
			for (const [graph, cy] of cys.current.entries()) {
				if (graph === id) {
					cy.container().parentElement.classList.add("selected")
				} else if (id !== "") {
					cy.$(`#${f}:unselected`).select()
				}

				if (focusRef.current !== null) {
					if (graph === focusRef.current) {
						cy.container().parentElement.classList.remove("selected")
					} else if (id !== "") {
						cy.$(`[id != "${f}"]:selected`).unselect()
					}
				}
			}

			if (onFocus !== undefined) {
				onFocus(id)
			} else {
				focusRef.current = id
			}
		}
	}, [])

	const handleUnselect = React.useCallback((id: string) => {
		if (id === focusRef.current) {
			for (const [graph, cy] of cys.current.entries()) {
				if (id === graph) {
					cy.container().parentElement.classList.remove("selected")
				}
				cy.$(`:selected`).unselect()
			}

			if (onFocus !== undefined) {
				onFocus(null)
			} else {
				focusRef.current = null
			}
		}
	}, [])

	const renderGraph = (graph: string) => (
		<GraphView
			key={graph}
			focus={focus}
			graph={graph}
			store={store}
			context={context}
			onSelect={handleSelect}
			onUnselect={handleUnselect}
			onMouseOver={handleMouseOver}
			onMouseOut={(id) => handleMouseOut(id, graph)}
			onMount={(cy) => cys.current.set(graph, cy)}
			onDestroy={() => cys.current.delete(graph)}
		/>
	)

	if (graphs.length === 0) {
		return renderGraph("")
	}

	return (
		<PanelGroup
			direction="row"
			borderColor={BorderColor}
			spacing={1}
			onUpdate={handleOuterUpdate}
			panelWidths={PanelWidths}
		>
			{renderGraph("")}
			<PanelGroup
				direction="column"
				borderColor={BorderColor}
				spacing={1}
				onUpdate={handleInnerUpdate}
			>
				{graphs.map(renderGraph)}
			</PanelGroup>
		</PanelGroup>
	)
}
