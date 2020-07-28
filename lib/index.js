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
const n3_ts_1 = require("n3.ts");
const graph_js_1 = __importDefault(require("./graph.js"));
const utils_js_1 = require("./utils.js");
exports.Graph = graph_js_1.default;
function Dataset({ dataset, context, focus, onFocus }) {
    const cys = React.useRef(new Map());
    const store = React.useMemo(() => (dataset instanceof n3_ts_1.Store ? dataset : new n3_ts_1.Store(dataset)), [dataset]);
    const defaultGraphSize = React.useMemo(() => store.countQuads(null, null, null, n3_ts_1.Default), [store]);
    const graphs = React.useMemo(() => {
        const graphs = [];
        for (const { termType, id } of store.getGraphs(null, null, null)) {
            if (termType !== "DefaultGraph") {
                graphs.push(id);
            }
        }
        return graphs;
    }, [store]);
    const focusRef = React.useRef(focus);
    React.useEffect(() => {
        focusRef.current = focus;
    }, [focus]);
    const handleInnerUpdate = React.useCallback((_) => {
        for (const graph of graphs) {
            if (cys.current.has(graph)) {
                cys.current.get(graph).resize();
            }
        }
    }, [graphs]);
    const handleOuterUpdate = React.useCallback((data) => {
        handleInnerUpdate(data);
        if (cys.current.has("")) {
            cys.current.get("").resize();
        }
    }, [handleInnerUpdate]);
    const handleMouseOver = React.useCallback((id) => {
        for (const [graph, cy] of cys.current.entries()) {
            if (id !== "") {
                cy.$("#" + utils_js_1.encode(id)).addClass("hover");
            }
            if (id === graph) {
                cy.container().parentElement.classList.add("hover");
            }
        }
    }, []);
    const handleMouseOut = React.useCallback((id, graph) => {
        if (id === null) {
            const forEach = (ele) => {
                const id = utils_js_1.decode(ele.id());
                if (cys.current.has(id)) {
                    cys.current
                        .get(id)
                        .container()
                        .parentElement.classList.remove("hover");
                }
            };
            cys.current.get(graph).$(".hover").forEach(forEach).removeClass("hover");
        }
        else {
            for (const [graph, cy] of cys.current.entries()) {
                if (id !== "") {
                    cy.$("#" + utils_js_1.encode(id)).removeClass("hover");
                }
                if (id === graph) {
                    cy.container().parentElement.classList.remove("hover");
                }
            }
        }
    }, []);
    const handleSelect = React.useCallback((id) => {
        if (id !== focusRef.current) {
            const f = utils_js_1.encode(id);
            for (const [graph, cy] of cys.current.entries()) {
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
            if (onFocus !== undefined) {
                onFocus(id);
            }
            else {
                focusRef.current = id;
            }
        }
    }, []);
    const handleUnselect = React.useCallback((id) => {
        if (id === focusRef.current) {
            for (const [graph, cy] of cys.current.entries()) {
                if (id === graph) {
                    cy.container().parentElement.classList.remove("selected");
                }
                cy.$(`:selected`).unselect();
            }
            if (onFocus !== undefined) {
                onFocus(null);
            }
            else {
                focusRef.current = null;
            }
        }
    }, []);
    const renderGraph = (graph) => (React.createElement(graph_js_1.default, { key: graph, focus: focus, graph: graph, store: store, context: context, onSelect: handleSelect, onUnselect: handleUnselect, onMouseOver: handleMouseOver, onMouseOut: (id) => handleMouseOut(id, graph), onMount: (cy) => cys.current.set(graph, cy), onDestroy: () => cys.current.delete(graph) }));
    if (graphs.length === 0) {
        return renderGraph("");
    }
    if (defaultGraphSize === 0) {
        return (React.createElement(react_panelgroup_1.default, { direction: "column", borderColor: utils_js_1.BorderColor, spacing: 1, onUpdate: handleInnerUpdate }, graphs.map(renderGraph)));
    }
    return (React.createElement(react_panelgroup_1.default, { direction: "row", borderColor: utils_js_1.BorderColor, spacing: 1, onUpdate: handleOuterUpdate, panelWidths: utils_js_1.PanelWidths },
        renderGraph(""),
        React.createElement(react_panelgroup_1.default, { direction: "column", borderColor: utils_js_1.BorderColor, spacing: 1, onUpdate: handleInnerUpdate }, graphs.map(renderGraph))));
}
exports.Dataset = Dataset;
//# sourceMappingURL=index.js.map