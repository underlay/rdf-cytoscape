/// <reference types="react" />
import { N3Store } from "n3";
import GraphView from "./graph";
export declare const Graph: typeof GraphView;
interface DatasetProps {
    context: {};
    store: N3Store;
    focus: string;
    onFocus(focus: string): void;
}
export declare function Dataset({ store, context, focus, onFocus }: DatasetProps): JSX.Element;
export {};
