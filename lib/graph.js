"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const cytoscape_1 = __importDefault(require("cytoscape"));
const jsonld_1 = require("jsonld");
const compact_1 = require("jsonld/lib/compact");
const context_1 = require("jsonld/lib/context");
const context_json_1 = __importDefault(require("./context.json"));
const node_1 = __importDefault(require("./node"));
const utils_1 = require("./utils");
function createNode({ id }, nodes, elements) {
    if (!nodes.has(id)) {
        const node = { literals: new Map(), types: [] };
        if (elements !== null) {
            node.index = elements.length;
            const element = {
                group: "nodes",
                data: { id: utils_1.encode(id) },
            };
            if (id.startsWith("_:")) {
                element.classes = "blankNode";
            }
            elements.push(element);
        }
        nodes.set(id, node);
    }
}
function makeElements(activeCtx, quads) {
    const compact = (iri, vocab) => compact_1.compactIri({ activeCtx, iri, relativeTo: { vocab: !!vocab } });
    const elements = [];
    const nodes = new Map();
    for (const [index, quad] of quads.entries()) {
        const { subject, predicate: { id: iri }, object, } = quad;
        createNode(subject, nodes, elements);
        if (object.termType === "Literal") {
            const { literals } = nodes.get(subject.id);
            if (literals.has(iri)) {
                literals.get(iri).push(object);
            }
            else {
                literals.set(iri, [object]);
            }
        }
        else if (object.termType === "NamedNode" && iri === utils_1.RDF.TYPE) {
            nodes.get(subject.id).types.push(object.id);
        }
        else {
            createNode(object, nodes, elements);
            elements.push({
                group: "edges",
                data: {
                    id: utils_1.encode(index.toString()),
                    iri,
                    name: compact(iri, true),
                    source: utils_1.encode(subject.id),
                    target: utils_1.encode(object.id),
                },
            });
        }
    }
    for (const [id, { literals, types, index }] of nodes.entries()) {
        const { data } = elements[index];
        if (id.startsWith("_:") && literals.size === 0 && types.length === 0) {
            data.svg = utils_1.DataURIPrefix + encodeURIComponent(utils_1.SVGPrefix);
            data.width = 36;
            data.height = 36;
            data.empty = true;
        }
        else {
            const [svg, width, height] = node_1.default(id, types, literals, compact);
            data.svg = utils_1.DataURIPrefix + encodeURIComponent(utils_1.SVGPrefix + svg);
            data.width = width;
            data.height = height;
        }
    }
    return elements;
}
const makeListener = (handler) => ({ target, }) => handler(utils_1.decode(target.id()));
function attachListeners(cy, { onSelect, onUnselect, onMouseOver, onMouseOut, focus, graph }) {
    const n = cy.nodes();
    if (typeof onMouseOver === "function") {
        n.on("mouseover", makeListener(onMouseOver));
    }
    if (typeof onMouseOut === "function") {
        n.on("mouseout", makeListener(onMouseOut));
        cy.on("mouseout", (_) => onMouseOut(null));
    }
    if (typeof onSelect === "function") {
        n.on("select", ({ target }) => {
            const id = utils_1.decode(target.id());
            onSelect(id);
        });
    }
    if (typeof onUnselect === "function") {
        n.on("unselect", ({ target }) => {
            const id = utils_1.decode(target.id());
            onUnselect(id);
        });
    }
    if (focus === graph) {
        cy.container().parentElement.classList.add("selected");
    }
    else if (typeof focus === "string" && focus !== null && focus !== "") {
        cy.$(`#${utils_1.encode(focus)}`).select();
    }
}
function makeEvents(cy) {
    return {
        reset: (_) => cy.fit(),
        bfs: (_) => cy.layout(utils_1.BreadthFirstLayout).run(),
        grid: () => cy.layout(utils_1.GridLayout).run(),
        random: () => cy.layout(utils_1.RandomLayout).run(),
        cose: () => cy.layout(utils_1.CoseLayout).run(),
    };
}
const activeCtx = context_1.getInitialContext({ base: "" });
async function getCtx(context) {
    return context === undefined
        ? jsonld_1.processContext(activeCtx, context_json_1.default, {})
        : jsonld_1.processContext(activeCtx, context, {});
}
function default_1(props) {
    const { store, graph, focus, context, onMount, onDestroy } = props;
    const [ctx, setCtx] = React.useState(null);
    React.useEffect(() => {
        getCtx(context)
            .then(setCtx)
            .catch((err) => console.error(err));
    }, [context]);
    const quads = React.useMemo(() => store.getQuads(null, null, null, graph), [
        store,
        graph,
    ]);
    const elements = React.useMemo(() => (ctx === null ? null : makeElements(ctx, quads)), [ctx, quads]);
    const [cy, setCy] = React.useState(null);
    React.useEffect(() => {
        if (elements !== null && cy !== null) {
            cy.batch(() => {
                cy.elements().remove();
                cy.add(elements);
            });
            cy.layout(utils_1.BreadthFirstLayout).run();
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
        const nextCy = cytoscape_1.default({
            container,
            style: utils_1.Style,
            minZoom: 0.1,
            maxZoom: 4,
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
exports.default = default_1;
//# sourceMappingURL=graph.js.map