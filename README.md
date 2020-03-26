# rdf-cytoscape

> React component for rendering RDF graphs and datasets using [n3.js](https://github.com/rdfjs/N3.js) and [cytoscape.js](https://github.com/cytoscape/cytoscape.js)

You can render either RDF Datasets or RDF Graphs. Datasets use [`react-panelgroup`](https://github.com/DanFessler/react-panelgroup) to split up the different graphs. Both elements take an [`N3Store`](http://rdf.js.org/N3.js/docs/N3Store.html) as a required prop; for Graphs you just specify the graph name that you want to element to render.

```typescript
import Graph from "rdf-cytoscape/lib/graph"
import Dataset from "rdf-cytoscape"
```

```typescript
interface GraphProps {
	store: N3Store
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

interface DatasetProps {
	context: {}
	store: N3Store
	focus: string
	onFocus(focus: string): void
}
```

Either way you need to include `rdf-cytoscape/rdf-cytoscape.css` in your HTML somewhere, and you need to add the `rdf-cytoscape` CSS class to the immediate parent.
