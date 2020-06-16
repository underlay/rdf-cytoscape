import { LayoutOptions, Stylesheet } from "cytoscape";
import { PanelWidth } from "react-panelgroup";
export declare const XSD: {
    STRING: string;
    BOOLEAN: string;
    INTEGER: string;
    DOUBLE: string;
    DATE: string;
    DATETIME: string;
};
export declare const RDF: {
    TYPE: string;
    LANG_STRING: string;
};
export declare const FONT_SIZE = 12;
export declare const TAB = 2;
export declare const CHAR = 7.2;
export declare const LINE_HEIGHT = 18;
export declare const FONT_FAMILY = "Monaco, monospace";
export declare const encode: (s: string) => string;
export declare const decode: (s: string) => string;
export declare const base32: RegExp;
export declare const fragment: RegExp;
export declare const DataURIPrefix = "data:image/svg+xml;utf8,";
export declare const SVGPrefix = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE svg>";
export declare const BaseLayoutOptions: {
    padding: number;
    animate: boolean;
    fit: boolean;
};
export declare const CoseLayout: LayoutOptions;
export declare const BreadthFirstLayout: LayoutOptions;
export declare const RandomLayout: LayoutOptions;
export declare const GridLayout: LayoutOptions;
export declare const Style: Stylesheet[];
export declare const BorderColor = "#36454F";
export declare const PanelWidths: PanelWidth[];
