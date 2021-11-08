import type { Literal } from "rdf-js";
export default function Node(id: string, types: string[], literals: Record<string, Literal[]>, compact: (term: string, vocab: boolean) => string): (string | number)[];
