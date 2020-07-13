"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XSD = {
    STRING: "http://www.w3.org/2001/XMLSchema#string",
    BOOLEAN: "http://www.w3.org/2001/XMLSchema#boolean",
    INTEGER: "http://www.w3.org/2001/XMLSchema#integer",
    DOUBLE: "http://www.w3.org/2001/XMLSchema#double",
    DATE: "http://www.w3.org/2001/XMLSchema#date",
    DATETIME: "http://www.w3.org/2001/XMLSchema#dateTime",
};
exports.RDF = {
    TYPE: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    LANG_STRING: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
};
exports.FONT_SIZE = 12;
exports.TAB = 2;
exports.CHAR = 7.2;
exports.LINE_HEIGHT = 18;
exports.FONT_FAMILY = "Monaco, monospace";
exports.encode = (s) => Buffer.from(s).toString("hex");
exports.decode = (s) => Buffer.from(s, "hex").toString("utf8");
exports.base32 = /^[a-z2-7]{59}$/;
exports.fragment = /^c14n(\d+)$/;
exports.DataURIPrefix = "data:image/svg+xml;utf8,";
exports.SVGPrefix = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>';
exports.BaseLayoutOptions = { padding: 12, animate: false, fit: true };
exports.CoseLayout = {
    ...exports.BaseLayoutOptions,
    name: "cose",
    randomize: true,
    idealEdgeLength: (ele) => (ele.data("name").length + exports.TAB * 8) * exports.CHAR,
};
exports.BreadthFirstLayout = {
    ...exports.BaseLayoutOptions,
    name: "breadthfirst",
    spacingFactor: 1,
    circle: false,
    directed: true,
};
exports.RandomLayout = {
    ...exports.BaseLayoutOptions,
    name: "random",
};
exports.GridLayout = {
    ...exports.BaseLayoutOptions,
    name: "grid",
};
exports.Style = [
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
exports.BorderColor = "#36454F";
exports.PanelWidths = [
    { size: 360, minSize: 300, resize: "dynamic" },
    { size: 1, minSize: 300, resize: "stretch" },
];
//# sourceMappingURL=utils.js.map