/// <reference types="react" />
import { QuadT } from "n3.ts";
import GraphView from "./graph.js";
export declare const Graph: typeof GraphView;
interface DatasetProps {
    dataset: Iterable<QuadT>;
    context?: {};
    focus?: string | null;
    onFocus?(focus: string): void;
}
export declare function Dataset({ dataset, context, focus, onFocus }: DatasetProps): JSX.Element;
export {};
