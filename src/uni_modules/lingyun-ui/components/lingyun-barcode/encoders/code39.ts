// @ts-nocheck
/**
 * Vendored from etiket 1.0.0 — MIT License.
 * Copyright (c) 2026 productdevbook
 * Source: https://github.com/productdevbook/etiket
 * See ../../../THIRD_PARTY_NOTICES.md for the full license text.
 */

import { InvalidInputError } from './errors'



const CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%";

const START_STOP_INDEX = 43;


const PATTERNS = [
	[
		1,
		1,
		1,
		3,
		3,
		1,
		3,
		1,
		1
	],
	[
		3,
		1,
		1,
		3,
		1,
		1,
		1,
		1,
		3
	],
	[
		1,
		1,
		3,
		3,
		1,
		1,
		1,
		1,
		3
	],
	[
		3,
		1,
		3,
		3,
		1,
		1,
		1,
		1,
		1
	],
	[
		1,
		1,
		1,
		3,
		3,
		1,
		1,
		1,
		3
	],
	[
		3,
		1,
		1,
		3,
		3,
		1,
		1,
		1,
		1
	],
	[
		1,
		1,
		3,
		3,
		3,
		1,
		1,
		1,
		1
	],
	[
		1,
		1,
		1,
		3,
		1,
		1,
		3,
		1,
		3
	],
	[
		3,
		1,
		1,
		3,
		1,
		1,
		3,
		1,
		1
	],
	[
		1,
		1,
		3,
		3,
		1,
		1,
		3,
		1,
		1
	],
	[
		3,
		1,
		1,
		1,
		1,
		3,
		1,
		1,
		3
	],
	[
		1,
		1,
		3,
		1,
		1,
		3,
		1,
		1,
		3
	],
	[
		3,
		1,
		3,
		1,
		1,
		3,
		1,
		1,
		1
	],
	[
		1,
		1,
		1,
		1,
		3,
		3,
		1,
		1,
		3
	],
	[
		3,
		1,
		1,
		1,
		3,
		3,
		1,
		1,
		1
	],
	[
		1,
		1,
		3,
		1,
		3,
		3,
		1,
		1,
		1
	],
	[
		1,
		1,
		1,
		1,
		1,
		3,
		3,
		1,
		3
	],
	[
		3,
		1,
		1,
		1,
		1,
		3,
		3,
		1,
		1
	],
	[
		1,
		1,
		3,
		1,
		1,
		3,
		3,
		1,
		1
	],
	[
		1,
		1,
		1,
		1,
		3,
		3,
		3,
		1,
		1
	],
	[
		3,
		1,
		1,
		1,
		1,
		1,
		1,
		3,
		3
	],
	[
		1,
		1,
		3,
		1,
		1,
		1,
		1,
		3,
		3
	],
	[
		3,
		1,
		3,
		1,
		1,
		1,
		1,
		3,
		1
	],
	[
		1,
		1,
		1,
		1,
		3,
		1,
		1,
		3,
		3
	],
	[
		3,
		1,
		1,
		1,
		3,
		1,
		1,
		3,
		1
	],
	[
		1,
		1,
		3,
		1,
		3,
		1,
		1,
		3,
		1
	],
	[
		1,
		1,
		1,
		1,
		1,
		1,
		3,
		3,
		3
	],
	[
		3,
		1,
		1,
		1,
		1,
		1,
		3,
		3,
		1
	],
	[
		1,
		1,
		3,
		1,
		1,
		1,
		3,
		3,
		1
	],
	[
		1,
		1,
		1,
		1,
		3,
		1,
		3,
		3,
		1
	],
	[
		3,
		3,
		1,
		1,
		1,
		1,
		1,
		1,
		3
	],
	[
		1,
		3,
		3,
		1,
		1,
		1,
		1,
		1,
		3
	],
	[
		3,
		3,
		3,
		1,
		1,
		1,
		1,
		1,
		1
	],
	[
		1,
		3,
		1,
		1,
		3,
		1,
		1,
		1,
		3
	],
	[
		3,
		3,
		1,
		1,
		3,
		1,
		1,
		1,
		1
	],
	[
		1,
		3,
		3,
		1,
		3,
		1,
		1,
		1,
		1
	],
	[
		1,
		3,
		1,
		1,
		1,
		1,
		3,
		1,
		3
	],
	[
		3,
		3,
		1,
		1,
		1,
		1,
		3,
		1,
		1
	],
	[
		1,
		3,
		3,
		1,
		1,
		1,
		3,
		1,
		1
	],
	[
		1,
		3,
		1,
		3,
		1,
		3,
		1,
		1,
		1
	],
	[
		1,
		3,
		1,
		3,
		1,
		1,
		1,
		3,
		1
	],
	[
		1,
		3,
		1,
		1,
		1,
		3,
		1,
		3,
		1
	],
	[
		1,
		1,
		1,
		3,
		1,
		3,
		1,
		3,
		1
	],
	[
		1,
		3,
		1,
		1,
		3,
		1,
		3,
		1,
		1
	]
];

const GAP = 1;

const CHAR_INDEX = new Map();
for (let i = 0; i < CHARSET.length; i++) {
	CHAR_INDEX.set(CHARSET[i], i);
}

const EXTENDED_MAP = [
	"%U",
	"$A",
	"$B",
	"$C",
	"$D",
	"$E",
	"$F",
	"$G",
	"$H",
	"$I",
	"$J",
	"$K",
	"$L",
	"$M",
	"$N",
	"$O",
	"$P",
	"$Q",
	"$R",
	"$S",
	"$T",
	"$U",
	"$V",
	"$W",
	"$X",
	"$Y",
	"$Z",
	"%A",
	"%B",
	"%C",
	"%D",
	"%E",
	" ",
	"/A",
	"/B",
	"/C",
	"/D",
	"/E",
	"/F",
	"/G",
	"/H",
	"/I",
	"/J",
	"/K",
	"/L",
	"-",
	".",
	"/O",
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"/Z",
	"%F",
	"%G",
	"%H",
	"%I",
	"%J",
	"%V",
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
	"O",
	"P",
	"Q",
	"R",
	"S",
	"T",
	"U",
	"V",
	"W",
	"X",
	"Y",
	"Z",
	"%K",
	"%L",
	"%M",
	"%N",
	"%O",
	"%W",
	"+A",
	"+B",
	"+C",
	"+D",
	"+E",
	"+F",
	"+G",
	"+H",
	"+I",
	"+J",
	"+K",
	"+L",
	"+M",
	"+N",
	"+O",
	"+P",
	"+Q",
	"+R",
	"+S",
	"+T",
	"+U",
	"+V",
	"+W",
	"+X",
	"+Y",
	"+Z",
	"%P",
	"%Q",
	"%R",
	"%S",
	"%T"
];

function appendPattern(bars, index) {
	const pattern = PATTERNS[index];
	for (const width of pattern) {
		bars.push(width);
	}
}

function calculateCheckDigit(indices) {
	let sum = 0;
	for (const index of indices) {
		sum += index;
	}
	return sum % 43;
}

export function encodeCode39(text, options) {
	const includeCheckDigit = options?.checkDigit ?? false;
	if (text.length === 0) {
		throw new InvalidInputError("Code 39 input must not be empty");
	}
	if (text.includes("*")) {
		throw new InvalidInputError("Code 39 input must not contain the start/stop character (*)");
	}
	
	const indices = [];
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		const index = CHAR_INDEX.get(ch);
		if (index === undefined) {
			throw new InvalidInputError(`Invalid Code 39 character: '${ch}' at position ${i}`);
		}
		indices.push(index);
	}
	
	if (includeCheckDigit) {
		indices.push(calculateCheckDigit(indices));
	}
	const bars = [];
	
	appendPattern(bars, START_STOP_INDEX);
	
	bars.push(GAP);
	
	for (let i = 0; i < indices.length; i++) {
		appendPattern(bars, indices[i]);
		bars.push(GAP);
	}
	
	appendPattern(bars, START_STOP_INDEX);
	return bars;
}

export function encodeCode39Extended(text, options) {
	if (text.length === 0) {
		throw new InvalidInputError("Code 39 Extended input must not be empty");
	}
	
	let mapped = "";
	for (let i = 0; i < text.length; i++) {
		const code = text.charCodeAt(i);
		if (code < 0 || code > 127) {
			throw new InvalidInputError(`Invalid Code 39 Extended character: '${text[i]}' (code ${code}) at position ${i} — only ASCII 0-127 supported`);
		}
		mapped += EXTENDED_MAP[code];
	}
	
	return encodeCode39(mapped, options);
}
