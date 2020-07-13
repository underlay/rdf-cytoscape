/// <reference types="react" />
import { Store } from "n3";
import GraphView from "./graph";
export declare const Graph: typeof GraphView;
interface DatasetProps {
    context: {};
    store: Store;
    focus?: string | null;
    onFocus?(focus: string): void;
}
export declare function Dataset({ store, context, focus, onFocus }: DatasetProps): JSX.Element;
export {};
