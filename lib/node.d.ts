/// <reference types="react" />
import { Literal } from "n3";
export default function Node(id: string, types: string[], literals: Map<string, Literal[]>, compact: (term: string, vocab: boolean) => string): import("react").ReactText[];
