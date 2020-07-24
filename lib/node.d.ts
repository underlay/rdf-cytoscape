import { TermT, LiteralT } from "n3.ts";
declare type Literal = TermT<LiteralT>;
export default function Node(id: string, types: string[], literals: Map<string, Literal[]>, compact: (term: string, vocab: boolean) => string): (string | number)[];
export {};
