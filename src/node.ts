import { FONT_SIZE, FONT_FAMILY, LINE_HEIGHT, TAB, CHAR } from "./utils"

import type { Literal } from "rdf-js"
import { rdf, xsd } from "@underlay/namespaces"

const prefixFills: { [prefix: string]: string } = {
	schema: "#990000",
	rdf: "#005A9C",
	prov: "green",
	ipfs: "#6ACAD1",
	dcterms: "#FF6600",
}

const valueClasses = {
	[xsd.string]: "s",
	[xsd.boolean]: "b",
	[xsd.integer]: "n",
	[xsd.double]: "n",
	[xsd.date]: "d",
	[xsd.dateTime]: "d",
}

const STYLE = `<style>
text { fill: black }
.q {
  fill: black;
  fill-opacity: 0.5;
}
.t { fill-opacity: 0.5 }
.s { fill: #0077AA }
.b { fill: #FF9900 }
.n { fill: #CA7841 }
.d { fill: #990055 }
</style>`

const quote = '<tspan class="q">"</tspan>'

function compactStyle(
	term: string,
	compact: (term: string, vocab: boolean) => string,
	vocab: boolean
): [string, string] {
	if (term && term[0] === "<" && term[term.length - 1] === ">") {
		term = term.slice(1, -1)
	}

	const compacted = compact(term, vocab)
	if (compacted !== undefined && compacted !== term) {
		const index = compacted.indexOf(":")
		if (index > -1) {
			return [compacted.slice(0, index), compacted.slice(index)]
		} else {
			return ["", compacted]
		}
	} else {
		return ["", term]
	}
}

function renderTerm(
	[prefix, suffix]: [string, string],
	x: number,
	y: number,
	className?: string
) {
	if (suffix && suffix[0] === "<" && suffix[suffix.length - 1] === ">") {
		suffix = suffix.slice(1, -1)
	}

	const text = className ? `text class="${className}"` : "text"
	if (suffix === "") {
		return `<${text} x="${x}" y="${y}">@${prefix}</text>`
	} else if (prefix === "") {
		if (suffix[0] === "_" && suffix[1] === ":") {
			const label = suffix.slice(2)
			return `<${text} x="${x}" y="${y}"><tspan class="q">_:</tspan>${label}</text>`
		} else if (suffix.indexOf(":") >= 0) {
			return `<${text} x="${x}" y="${y}">${suffix}</text>`
		} else {
			return `<${text} x="${x}" y="${y}">${suffix}</text>`
		}
	} else if (prefixFills.hasOwnProperty(prefix)) {
		return `<${text} x="${x}" y="${y}"><tspan fill="${prefixFills[prefix]}">${prefix}</tspan>${suffix}</text>`
	} else {
		return `<${text} x="${x}" y="${y}"><tspan>${prefix}</tspan>${suffix}</text>`
	}
}

function renderLiteral(
	{ value, datatype: { value: type }, language }: Literal,
	x: number,
	y: number
) {
	if (type === rdf.langString && false) {
		// TODO: render language tagged strings
	} else if (valueClasses.hasOwnProperty(type)) {
		// Adjust for quotes (not rendered on non-string primitives)
		const adjustedValue = type === xsd.string ? quote + value + quote : value
		const adjustedX = type === xsd.string ? x : x + CHAR
		return `<text x="${adjustedX}" y="${y}" class="s">${adjustedValue}</text>`
	} else {
		return `<text x="${x}" y="${y}">${quote + value + quote}</text>`
	}
}

const getLength = ([prefix, suffix]: [string, string]) =>
	prefix.length + suffix.length

export default function Node(
	id: string,
	types: string[],
	literals: Record<string, Literal[]>,
	compact: (term: string, vocab: boolean) => string
) {
	const literalKeys = Object.keys(literals)
	const literalValues = Object.values(literals)
	const compactKeys = literalKeys.map((key) => compactStyle(key, compact, true))
	const compactRDFTypes = types.map((type) => compactStyle(type, compact, true))
	const compactDataTypes = literalValues.map((value) =>
		value.map((literal: Literal): [string, string] => {
			if (literal.datatype.value === rdf.langString) {
				return [literal.language, ""]
			} else {
				return compactStyle(literal.datatype.value, compact, true)
			}
		})
	)

	const name = id.startsWith("_:") ? null : compactStyle(id, compact, false)
	const type = compactStyle(rdf.type, compact, true)

	const rdfTypes =
		compactRDFTypes.length &&
		Math.max.apply(null, compactRDFTypes.map(getLength))

	const properties = Math.max(
		types.length && getLength(type),
		literals.size && Math.max.apply(null, compactKeys.map(getLength))
	)

	const propertiesOffset = 6 + (properties + TAB) * CHAR

	const dataTypes =
		literals.size &&
		Math.max.apply(
			null,
			compactDataTypes.map((types) =>
				Math.max.apply(null, types.map(getLength))
			)
		)

	const dataValues =
		literals.size &&
		Math.max.apply(
			null,
			literalValues.flatMap((value) =>
				value.map((literal) => 1 + literal.value.length + 1)
			)
		)

	const width =
		2 * 6 +
		CHAR *
			Math.max(
				TAB,
				name === null ? 0 : getLength(name),
				properties + TAB + Math.max(rdfTypes, dataTypes + TAB + dataValues)
			)

	const lines = ["", STYLE]
	let height = 2
	if (name !== null) {
		lines.push(renderTerm(name, 6, 16))
		height += LINE_HEIGHT
	}
	// let height = LINE_HEIGHT + 2

	if (types.length > 0 || literalKeys.length > 0) {
		let top = LINE_HEIGHT
		if (name !== null) {
			top += LINE_HEIGHT + 4
			lines.push(
				`<line x1="6" y1="22" x2="${
					width - 6
				}" y2="22" stroke="lightgrey" stroke-opacity="1"/>`
			)
		}

		if (types.length) {
			lines.push(renderTerm(type, 6, top))
			for (let i = 0; i < compactRDFTypes.length; i++) {
				lines.push(
					renderTerm(
						compactRDFTypes[i],
						propertiesOffset,
						top + LINE_HEIGHT * i
					)
				)
			}

			if (literals.size) {
				const y = top + compactRDFTypes.length * LINE_HEIGHT - 12
				top = y + 16
				lines.push(
					`<line x1="${propertiesOffset}" y1="${y}" x2="${
						width - 6
					}" y2="${y}" stroke="lightgrey" stroke-opacity="1"/>`
				)
			} else {
				top += LINE_HEIGHT * types.length
			}
		}

		const h = compactKeys.reduce((j, term, i) => {
			lines.push(renderTerm(term, 6, top + j * LINE_HEIGHT))
			for (let k = 0; k < compactDataTypes[i].length; k++) {
				lines.push(
					renderTerm(
						compactDataTypes[i][k],
						propertiesOffset,
						top + (k + j) * LINE_HEIGHT,
						"t"
					)
				)
			}

			const l: Literal[] = literalValues[i]
			for (let k = 0; k < l.length; k++) {
				lines.push(
					renderLiteral(
						l[k],
						propertiesOffset + (dataTypes + TAB) * CHAR,
						top + (k + j) * LINE_HEIGHT
					)
				)
			}

			return j + compactDataTypes[i].length
		}, 0)

		height = top + h * LINE_HEIGHT - 10
	}

	if (height === LINE_HEIGHT + 2) {
		height += 2
	}

	lines[0] = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" font-size="${FONT_SIZE}" font-family="${FONT_FAMILY}">`

	lines.push("</svg>")

	return [lines.join("\n"), width, height]
}
