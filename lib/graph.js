import * as React from "react";
import cytoscape from "cytoscape";
import { processContext } from "jsonld";
import { compactIri } from "jsonld/lib/compact";
import { getInitialContext } from "jsonld/lib/context";
import { rdf } from "@underlay/namespaces";
import { context as localCtx } from "./context.js";
import Node from "./node.js";
import { encode, decode, Style, BreadthFirstLayout, GridLayout, CoseLayout, RandomLayout, DataURIPrefix, SVGPrefix, } from "./utils";
function createNode({ id, termType }, nodes, elements) {
    if (id in nodes) {
        return;
    }
    else {
        nodes[id] = { index: elements.length, literals: {}, types: [] };
        const element = {
            group: "nodes",
            data: { id: encode(id) },
        };
        if (termType === "BlankNode") {
            element.classes = "blankNode";
        }
        elements.push(element);
    }
}
function makeElements(activeCtx, quads) {
    const compact = (iri, vocab) => {
        try {
            return compactIri({ activeCtx, iri, relativeTo: { vocab: !!vocab } });
        }
        catch (e) {
            return iri;
        }
    };
    const elements = [];
    const nodes = {};
    for (const [index, quad] of quads.entries()) {
        const { subject, predicate: { value: iri }, object, } = quad;
        const subjectId = subject.id;
        const objectId = object.id;
        createNode(subject, nodes, elements);
        if (object.termType === "Literal") {
            const { literals } = nodes[subjectId];
            if (iri in literals) {
                literals[iri].push(object);
            }
            else {
                literals[iri] = [object];
            }
        }
        else if (object.termType === "NamedNode" && iri === rdf.type) {
            nodes[subjectId].types.push(objectId);
        }
        else {
            createNode(object, nodes, elements);
            elements.push({
                group: "edges",
                data: {
                    id: encode(index.toString()),
                    iri,
                    name: compact(iri, true),
                    source: encode(subjectId),
                    target: encode(objectId),
                },
            });
        }
    }
    for (const [id, { literals, types, index }] of Object.entries(nodes)) {
        const { data } = elements[index];
        const { length } = Object.keys(literals);
        if (id.startsWith("_:") && length === 0 && types.length === 0) {
            data.width = 36;
            data.height = 36;
            data.empty = true;
        }
        else {
            const [svg, width, height] = Node(id, types, literals, compact);
            data.svg = DataURIPrefix + encodeURIComponent(SVGPrefix + svg);
            data.width = width;
            data.height = height;
        }
    }
    return elements;
}
const makeListener = (handler) => ({ target }) => handler(decode(target.id()));
function attachListeners(cy, { onSelect, onUnselect, onMouseOver, onMouseOut, focus, graph }) {
    const n = cy.nodes();
    if (typeof onMouseOver === "function") {
        n.on("mouseover", makeListener(onMouseOver));
    }
    if (typeof onMouseOut === "function") {
        n.on("mouseout", makeListener(onMouseOut));
    }
    if (typeof onSelect === "function") {
        n.on("select", ({ target }) => {
            const id = decode(target.id());
            onSelect(id);
        });
    }
    if (typeof onUnselect === "function") {
        n.on("unselect", ({ target }) => {
            const id = decode(target.id());
            onUnselect(id);
        });
    }
    if (focus === graph) {
        const container = cy.container();
        if (container !== null && container.parentElement !== null) {
            container.parentElement.classList.add("selected");
        }
    }
    else if (typeof focus === "string" && focus !== null && focus !== "") {
        cy.$(`#${encode(focus)}`).select();
    }
}
function makeEvents(cy) {
    return {
        reset: (_) => cy.fit(),
        bfs: (_) => cy.layout(BreadthFirstLayout).run(),
        grid: () => cy.layout(GridLayout).run(),
        random: () => cy.layout(RandomLayout).run(),
        cose: () => cy.layout(CoseLayout).run(),
    };
}
const activeCtx = getInitialContext({ base: "" });
async function getCtx(context) {
    return context === undefined
        ? processContext(activeCtx, localCtx, {})
        : processContext(activeCtx, context, {});
}
export default function (props) {
    const { store: store, graph, focus, context, onMount, onDestroy } = props;
    const [ctx, setCtx] = React.useState(null);
    React.useEffect(() => {
        getCtx(context)
            .then(setCtx)
            .catch((err) => console.error(err));
    }, [context]);
    const quads = React.useMemo(() => store.getQuads(null, null, null, graph), [store, graph]);
    const elements = React.useMemo(() => (ctx === null ? null : makeElements(ctx, quads)), [ctx, quads]);
    const [cy, setCy] = React.useState(null);
    React.useEffect(() => {
        if (elements !== null && cy !== null) {
            cy.batch(() => {
                cy.elements().remove();
                cy.add(elements);
            });
            cy.layout(BreadthFirstLayout).run();
            attachListeners(cy, props);
        }
    }, [elements, cy]);
    const attachRef = React.useCallback((container) => {
        // Neither of these should really happen?
        if (container === null) {
            return;
        }
        else if (cy !== null) {
            return;
        }
        const nextCy = cytoscape({
            container,
            style: Style,
            minZoom: 0.2,
            maxZoom: 2,
            zoom: 1,
        });
        if (typeof onDestroy === "function") {
            nextCy.on("destroy", (_) => onDestroy());
        }
        if (typeof onMount === "function") {
            onMount(nextCy);
        }
        setCy(nextCy);
    }, [focus, graph]);
    const events = React.useMemo(() => (cy === null ? {} : makeEvents(cy)), [cy]);
    if (ctx === null) {
        return null;
    }
    const className = graph === "" ? "graph default" : "graph";
    return (React.createElement("div", { className: className },
        React.createElement("div", { className: "control" },
            graph.startsWith("_:") ? null : React.createElement("span", null, graph),
            React.createElement("button", { onClick: events.random }, "Random"),
            React.createElement("button", { onClick: events.grid }, "Grid"),
            React.createElement("button", { onClick: events.bfs }, "BFS"),
            React.createElement("button", { onClick: events.cose }, "Cose"),
            "|",
            React.createElement("button", { onClick: events.reset }, "Reset")),
        React.createElement("div", { className: "container", ref: attachRef })));
}
