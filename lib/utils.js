import { Buffer } from "buffer";
export const FONT_SIZE = 12;
export const TAB = 2;
export const CHAR = 7.2;
export const LINE_HEIGHT = 18;
export const FONT_FAMILY = "Monaco, monospace";
export const encode = (s) => Buffer.from(s).toString("hex");
export const decode = (s) => Buffer.from(s, "hex").toString("utf8");
export const base32 = /^[a-z2-7]{59}$/;
export const fragment = /^c14n(\d+)$/;
export const DataURIPrefix = "data:image/svg+xml;utf8,";
export const SVGPrefix = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>';
export const BaseLayoutOptions = { padding: 12, animate: false, fit: true };
export const CoseLayout = {
    ...BaseLayoutOptions,
    name: "cose",
    randomize: true,
    idealEdgeLength: (ele) => (ele.data("name").length + TAB * 8) * CHAR,
};
export const BreadthFirstLayout = {
    ...BaseLayoutOptions,
    name: "breadthfirst",
    spacingFactor: 1,
    circle: false,
    directed: true,
};
export const RandomLayout = {
    ...BaseLayoutOptions,
    name: "random",
};
export const GridLayout = {
    ...BaseLayoutOptions,
    name: "grid",
};
export const Style = [
    {
        selector: "node",
        style: {
            shape: "rectangle",
            "background-color": "floralwhite",
            width: "data(width)",
            height: "data(height)",
            "border-width": 1,
            "border-style": "solid",
            "border-color": "lightgrey",
        },
    },
    {
        selector: "node[^empty]",
        style: {
            "background-image": "data(svg)",
        },
    },
    {
        selector: "node.blankNode[?empty]",
        style: { shape: "ellipse" },
    },
    {
        selector: "node.blankNode[^empty]",
        style: { shape: "round-rectangle" },
    },
    {
        selector: "node:selected",
        style: { "border-color": "#36454f" },
    },
    {
        selector: "node.hover",
        style: { "border-color": "#36454f" },
    },
    {
        selector: "edge",
        style: {
            label: "data(name)",
            width: 8,
            "font-size": 12,
            "line-color": "#ccc",
            "edge-distances": "node-position",
            "text-background-color": "ghostwhite",
            "text-background-padding": "4",
            "text-background-opacity": 1,
            "curve-style": "bezier",
            "font-family": "Monaco, monospace",
            "target-arrow-color": "#ccc",
            "target-arrow-shape": "triangle",
            "text-rotation": "autorotate",
        },
    },
];
export const BorderColor = "#36454F";
export const PanelWidths = [
    { size: 360, minSize: 300, resize: "dynamic" },
    { size: 1, minSize: 300, resize: "stretch" },
];
