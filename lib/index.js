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
const react_panelgroup_1 = __importDefault(require("react-panelgroup"));
const graph_1 = __importDefault(require("./graph"));
const utils_1 = require("./utils");
const GraphNameError = new Error("Invalid message: only named graphs with blank graph names are allowed.");
exports.Graph = graph_1.default;
function Dataset({ store, context, focus, onFocus }) {
    const { current: cys } = React.useRef(new Map());
    const graphs = React.useMemo(() => {
        const graphs = [];
        const forGraphs = ({ termType, id }) => {
            if (termType === "BlankNode") {
                graphs.push(id);
            }
            else if (termType !== "DefaultGraph") {
                throw GraphNameError;
            }
        };
        store.forGraphs(forGraphs, null, null, null);
        return graphs;
    }, [store]);
    const focusRef = React.useRef(focus);
    React.useEffect(() => {
        focusRef.current = focus;
    }, [focus]);
    const handleOuterUpdate = (_) => {
        for (const graph of graphs) {
            cys.get(graph).resize();
        }
    };
    const handleInnerUpdate = (data) => {
        handleInnerUpdate(data);
        cys.get("").resize();
    };
    const handleMouseOver = React.useCallback((id) => {
        for (const [graph, cy] of cys.entries()) {
            if (id !== "") {
                cy.$("#" + utils_1.encode(id)).classes("hover");
            }
            if (id === graph) {
                cy.container().parentElement.classList.add("hover");
            }
        }
    }, []);
    const handleMouseOut = React.useCallback((id, graph) => {
        if (id === null) {
            cys
                .get(graph)
                .$(".hover")
                .forEach(ele => {
                const id = utils_1.decode(ele.id());
                if (cys.has(id)) {
                    cys
                        .get(id)
                        .container()
                        .parentElement.classList.remove("hover");
                }
            })
                .classes("");
        }
        else {
            for (const [graph, cy] of cys.entries()) {
                if (id !== "") {
                    cy.$("#" + utils_1.encode(id)).classes("");
                }
                if (id === graph) {
                    cy.container().parentElement.classList.remove("hover");
                }
            }
        }
    }, []);
    const handleSelect = React.useCallback((id) => {
        if (id !== focusRef.current) {
            const f = utils_1.encode(id);
            for (const [graph, cy] of cys.entries()) {
                if (graph === id) {
                    cy.container().parentElement.classList.add("selected");
                }
                else if (id !== "") {
                    cy.$(`#${f}:unselected`).select();
                }
                if (focusRef.current !== null) {
                    if (graph === focusRef.current) {
                        cy.container().parentElement.classList.remove("selected");
                    }
                    else if (id !== "") {
                        cy.$(`[id != "${f}"]:selected`).unselect();
                    }
                }
            }
            onFocus(id);
        }
    }, []);
    const handleUnselect = React.useCallback((id) => {
        if (id === focusRef.current) {
            for (const [graph, cy] of cys.entries()) {
                if (id === graph) {
                    cy.container().parentElement.classList.remove("selected");
                }
                cy.$(`:selected`).unselect();
            }
            onFocus(null);
        }
    }, []);
    const renderGraph = (graph) => (React.createElement(graph_1.default, { key: graph, focus: focus, graph: graph, store: store, context: context, onSelect: handleSelect, onUnselect: handleUnselect, onMouseOver: handleMouseOver, onMouseOut: id => handleMouseOut(id, graph), onMount: cy => cys.set(graph, cy), onDestroy: () => cys.delete(graph) }));
    return (React.createElement(react_panelgroup_1.default, { direction: "row", borderColor: utils_1.BorderColor, spacing: 1, onUpdate: handleOuterUpdate, panelWidths: utils_1.PanelWidths },
        renderGraph(""),
        React.createElement(react_panelgroup_1.default, { direction: "column", borderColor: utils_1.BorderColor, spacing: 1, onUpdate: handleInnerUpdate }, graphs.map(renderGraph))));
}
exports.Dataset = Dataset;
//# sourceMappingURL=index.js.map