/// <reference types="react" />
import cytoscape from "cytoscape";
import { N3Store } from "n3";
interface GraphProps {
    store: N3Store;
    graph: string;
    focus: string;
    activeCtx: {};
    onSelect(focus: string): void;
    onUnselect(focus: string): void;
    onMouseOver(focus: string): void;
    onMouseOut(focus: string): void;
    onMount(cy: cytoscape.Core): void;
    onDestroy(): void;
}
export default function (props: GraphProps): JSX.Element;
export {};
