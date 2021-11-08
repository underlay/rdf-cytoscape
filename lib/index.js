import * as React from "react";
import PanelGroup from "react-panelgroup";
import { Store, DataFactory } from "n3";
import GraphView from "./graph.js";
import { encode, BorderColor, PanelWidths, decode } from "./utils.js";
export const Graph = GraphView;
const Default = DataFactory.defaultGraph();
export function Dataset({ dataset, context, focus, onFocus }) {
    const cys = React.useRef(new Map());
    const store = React.useMemo(() => (dataset instanceof Store ? dataset : new Store(Array.from(dataset))), [dataset]);
    const defaultGraphSize = React.useMemo(() => store.countQuads(null, null, null, Default), [store]);
    const graphs = React.useMemo(() => {
        const graphs = [];
        for (const { termType, id } of store.getGraphs(null, null, null)) {
            if (termType !== "DefaultGraph") {
                graphs.push(id);
            }
        }
        return graphs;
    }, [store]);
    const focusRef = React.useRef(focus === undefined ? null : focus);
    React.useEffect(() => {
        if (focus !== undefined) {
            focusRef.current = focus;
        }
    }, [focus]);
    const handleInnerUpdate = React.useCallback((_) => {
        for (const graph of graphs) {
            const cy = cys.current.get(graph);
            if (cy !== undefined) {
                cy.resize();
            }
        }
    }, [graphs]);
    const handleOuterUpdate = React.useCallback((data) => {
        handleInnerUpdate(data);
        const cy = cys.current.get("");
        if (cy !== undefined) {
            cy.resize();
        }
    }, [handleInnerUpdate]);
    const handleMouseOver = React.useCallback((id) => {
        for (const [graph, cy] of cys.current.entries()) {
            if (id !== "") {
                cy.$("#" + encode(id)).addClass("hover");
            }
            if (id === graph) {
                const container = cy.container();
                if (container !== null && container.parentElement !== null) {
                    container.classList.add("hover");
                }
            }
        }
    }, []);
    const handleMouseOut = React.useCallback((id, graph) => {
        if (id === null) {
            const forEach = (ele) => {
                const id = decode(ele.id());
                const cy = cys.current.get(id);
                if (cy !== undefined) {
                    const container = cy.container();
                    if (container !== null && container.parentElement !== null) {
                        container.parentElement.classList.remove("hover");
                    }
                }
            };
            const cy = cys.current.get(graph);
            if (cy !== undefined) {
                cy.$(".hover").forEach(forEach).removeClass("hover");
            }
        }
        else {
            for (const [graph, cy] of cys.current.entries()) {
                if (id !== "") {
                    cy.$("#" + encode(id)).removeClass("hover");
                }
                if (id === graph) {
                    const container = cy.container();
                    if (container !== null && container.parentElement !== null) {
                        container.parentElement.classList.remove("hover");
                    }
                }
            }
        }
    }, []);
    const handleSelect = React.useCallback((id) => {
        if (id !== focusRef.current) {
            const f = encode(id);
            for (const [graph, cy] of cys.current.entries()) {
                const container = cy.container();
                if (graph === id) {
                    if (container !== null && container.parentElement !== null) {
                        container.parentElement.classList.add("selected");
                    }
                }
                else if (id !== "") {
                    cy.$(`#${f}:unselected`).select();
                }
                if (focusRef.current !== null) {
                    if (graph === focusRef.current) {
                        if (container !== null && container.parentElement !== null) {
                            container.parentElement.classList.remove("selected");
                        }
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
                    const container = cy.container();
                    if (container !== null && container.parentElement !== null) {
                        container.parentElement.classList.remove("selected");
                    }
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
    const renderGraph = (graph) => (React.createElement(GraphView, { key: graph, focus: focusRef.current, graph: graph, store: store, context: context, onSelect: handleSelect, onUnselect: handleUnselect, onMouseOver: handleMouseOver, onMouseOut: (id) => handleMouseOut(id, graph), onMount: (cy) => cys.current.set(graph, cy), onDestroy: () => cys.current.delete(graph) }));
    if (graphs.length === 0) {
        return renderGraph("");
    }
    if (defaultGraphSize === 0) {
        return (React.createElement(PanelGroup, { direction: "column", borderColor: BorderColor, spacing: 1, onUpdate: handleInnerUpdate }, graphs.map(renderGraph)));
    }
    return (React.createElement(PanelGroup, { direction: "row", borderColor: BorderColor, spacing: 1, onUpdate: handleOuterUpdate, panelWidths: PanelWidths },
        renderGraph(""),
        React.createElement(PanelGroup, { direction: "column", borderColor: BorderColor, spacing: 1, onUpdate: handleInnerUpdate }, graphs.map(renderGraph))));
}
