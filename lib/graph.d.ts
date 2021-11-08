/// <reference types="react" />
import cytoscape from "cytoscape";
import { Store } from "n3";
interface GraphProps {
    store: Store;
    graph: string;
    focus: string | null;
    context?: {};
    onSelect?(focus: string): void;
    onUnselect?(focus: string): void;
    onMouseOver?(focus: string): void;
    onMouseOut?(focus: string): void;
    onMount?(cy: cytoscape.Core): void;
    onDestroy?(): void;
}
export default function (props: GraphProps): JSX.Element | null;
export {};
