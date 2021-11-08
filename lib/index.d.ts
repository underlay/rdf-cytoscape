/// <reference types="react" />
import type { Quad } from "rdf-js";
import GraphView from "./graph.js";
export declare const Graph: typeof GraphView;
interface DatasetProps {
    dataset: Iterable<Quad>;
    context?: {};
    focus?: string | null;
    onFocus?(focus: string | null): void;
}
export declare function Dataset({ dataset, context, focus, onFocus }: DatasetProps): JSX.Element;
export {};
