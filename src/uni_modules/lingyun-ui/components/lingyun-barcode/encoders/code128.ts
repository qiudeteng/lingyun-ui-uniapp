// @ts-nocheck
/**
 * Vendored from etiket 1.0.0 — MIT License.
 * Copyright (c) 2026 productdevbook
 * Source: https://github.com/productdevbook/etiket
 * See ../../../THIRD_PARTY_NOTICES.md for the full license text.
 */

import { InvalidInputError } from './errors'


const PATTERNS = [
	[
		2,
		1,
		2,
		2,
		2,
		2
	],
	[
		2,
		2,
		2,
		1,
		2,
		2
	],
	[
		2,
		2,
		2,
		2,
		2,
		1
	],
	[
		1,
		2,
		1,
		2,
		2,
		3
	],
	[
		1,
		2,
		1,
		3,
		2,
		2
	],
	[
		1,
		3,
		1,
		2,
		2,
		2
	],
	[
		1,
		2,
		2,
		2,
		1,
		3
	],
	[
		1,
		2,
		2,
		3,
		1,
		2
	],
	[
		1,
		3,
		2,
		2,
		1,
		2
	],
	[
		2,
		2,
		1,
		2,
		1,
		3
	],
	[
		2,
		2,
		1,
		3,
		1,
		2
	],
	[
		2,
		3,
		1,
		2,
		1,
		2
	],
	[
		1,
		1,
		2,
		2,
		3,
		2
	],
	[
		1,
		2,
		2,
		1,
		3,
		2
	],
	[
		1,
		2,
		2,
		2,
		3,
		1
	],
	[
		1,
		1,
		3,
		2,
		2,
		2
	],
	[
		1,
		2,
		3,
		1,
		2,
		2
	],
	[
		1,
		2,
		3,
		2,
		2,
		1
	],
	[
		2,
		2,
		3,
		2,
		1,
		1
	],
	[
		2,
		2,
		1,
		1,
		3,
		2
	],
	[
		2,
		2,
		1,
		2,
		3,
		1
	],
	[
		2,
		1,
		3,
		2,
		1,
		2
	],
	[
		2,
		2,
		3,
		1,
		1,
		2
	],
	[
		3,
		1,
		2,
		1,
		3,
		1
	],
	[
		3,
		1,
		1,
		2,
		2,
		2
	],
	[
		3,
		2,
		1,
		1,
		2,
		2
	],
	[
		3,
		2,
		1,
		2,
		2,
		1
	],
	[
		3,
		1,
		2,
		2,
		1,
		2
	],
	[
		3,
		2,
		2,
		1,
		1,
		2
	],
	[
		3,
		2,
		2,
		2,
		1,
		1
	],
	[
		2,
		1,
		2,
		1,
		2,
		3
	],
	[
		2,
		1,
		2,
		3,
		2,
		1
	],
	[
		2,
		3,
		2,
		1,
		2,
		1
	],
	[
		1,
		1,
		1,
		3,
		2,
		3
	],
	[
		1,
		3,
		1,
		1,
		2,
		3
	],
	[
		1,
		3,
		1,
		3,
		2,
		1
	],
	[
		1,
		1,
		2,
		3,
		1,
		3
	],
	[
		1,
		3,
		2,
		1,
		1,
		3
	],
	[
		1,
		3,
		2,
		3,
		1,
		1
	],
	[
		2,
		1,
		1,
		3,
		1,
		3
	],
	[
		2,
		3,
		1,
		1,
		1,
		3
	],
	[
		2,
		3,
		1,
		3,
		1,
		1
	],
	[
		1,
		1,
		2,
		1,
		3,
		3
	],
	[
		1,
		1,
		2,
		3,
		3,
		1
	],
	[
		1,
		3,
		2,
		1,
		3,
		1
	],
	[
		1,
		1,
		3,
		1,
		2,
		3
	],
	[
		1,
		1,
		3,
		3,
		2,
		1
	],
	[
		1,
		3,
		3,
		1,
		2,
		1
	],
	[
		3,
		1,
		3,
		1,
		2,
		1
	],
	[
		2,
		1,
		1,
		3,
		3,
		1
	],
	[
		2,
		3,
		1,
		1,
		3,
		1
	],
	[
		2,
		1,
		3,
		1,
		1,
		3
	],
	[
		2,
		1,
		3,
		3,
		1,
		1
	],
	[
		2,
		1,
		3,
		1,
		3,
		1
	],
	[
		3,
		1,
		1,
		1,
		2,
		3
	],
	[
		3,
		1,
		1,
		3,
		2,
		1
	],
	[
		3,
		3,
		1,
		1,
		2,
		1
	],
	[
		3,
		1,
		2,
		1,
		1,
		3
	],
	[
		3,
		1,
		2,
		3,
		1,
		1
	],
	[
		3,
		3,
		2,
		1,
		1,
		1
	],
	[
		3,
		1,
		4,
		1,
		1,
		1
	],
	[
		2,
		2,
		1,
		4,
		1,
		1
	],
	[
		4,
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
		2,
		2,
		4
	],
	[
		1,
		1,
		1,
		4,
		2,
		2
	],
	[
		1,
		2,
		1,
		1,
		2,
		4
	],
	[
		1,
		2,
		1,
		4,
		2,
		1
	],
	[
		1,
		4,
		1,
		1,
		2,
		2
	],
	[
		1,
		4,
		1,
		2,
		2,
		1
	],
	[
		1,
		1,
		2,
		2,
		1,
		4
	],
	[
		1,
		1,
		2,
		4,
		1,
		2
	],
	[
		1,
		2,
		2,
		1,
		1,
		4
	],
	[
		1,
		2,
		2,
		4,
		1,
		1
	],
	[
		1,
		4,
		2,
		1,
		1,
		2
	],
	[
		1,
		4,
		2,
		2,
		1,
		1
	],
	[
		2,
		4,
		1,
		2,
		1,
		1
	],
	[
		2,
		2,
		1,
		1,
		1,
		4
	],
	[
		4,
		1,
		3,
		1,
		1,
		1
	],
	[
		2,
		4,
		1,
		1,
		1,
		2
	],
	[
		1,
		3,
		4,
		1,
		1,
		1
	],
	[
		1,
		1,
		1,
		2,
		4,
		2
	],
	[
		1,
		2,
		1,
		1,
		4,
		2
	],
	[
		1,
		2,
		1,
		2,
		4,
		1
	],
	[
		1,
		1,
		4,
		2,
		1,
		2
	],
	[
		1,
		2,
		4,
		1,
		1,
		2
	],
	[
		1,
		2,
		4,
		2,
		1,
		1
	],
	[
		4,
		1,
		1,
		2,
		1,
		2
	],
	[
		4,
		2,
		1,
		1,
		1,
		2
	],
	[
		4,
		2,
		1,
		2,
		1,
		1
	],
	[
		2,
		1,
		2,
		1,
		4,
		1
	],
	[
		2,
		1,
		4,
		1,
		2,
		1
	],
	[
		4,
		1,
		2,
		1,
		2,
		1
	],
	[
		1,
		1,
		1,
		1,
		4,
		3
	],
	[
		1,
		1,
		1,
		3,
		4,
		1
	],
	[
		1,
		3,
		1,
		1,
		4,
		1
	],
	[
		1,
		1,
		4,
		1,
		1,
		3
	],
	[
		1,
		1,
		4,
		3,
		1,
		1
	],
	[
		4,
		1,
		1,
		1,
		1,
		3
	],
	[
		4,
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
		1,
		4,
		1
	],
	[
		1,
		1,
		4,
		1,
		3,
		1
	],
	[
		3,
		1,
		1,
		1,
		4,
		1
	],
	[
		4,
		1,
		1,
		1,
		3,
		1
	],
	[
		2,
		1,
		1,
		4,
		1,
		2
	],
	[
		2,
		1,
		1,
		2,
		1,
		4
	],
	[
		2,
		1,
		1,
		2,
		3,
		2
	]
];
const STOP_PATTERN = [
	2,
	3,
	3,
	1,
	1,
	1,
	2
];
const START_A = 103;
const START_B = 104;
const START_C = 105;
const CODE_A = 101;
const CODE_B = 100;
const CODE_C = 99;
const SHIFT = 98;

const FNC4_A = 101;
const FNC4_B = 100;

export function encodeCode128(text, options) {
	const charset = options?.charset ?? "auto";
	let codes;
	switch (charset) {
		case "auto":
			codes = autoEncode(text);
			break;
		case "A":
			codes = encodeCharsetA(text);
			break;
		case "B":
			codes = encodeCharsetB(text);
			break;
		case "C":
			codes = encodeCharsetC(text);
			break;
		default: throw new InvalidInputError(`Invalid Code 128 charset: ${charset}`);
	}
	const bars = [];
	for (const code of codes) {
		const pattern = PATTERNS[code];
		for (const width of pattern) {
			bars.push(width);
		}
	}
	
	for (const width of STOP_PATTERN) {
		bars.push(width);
	}
	return bars;
}

function runsFrom(text) {
	const length = text.length;
	const numeric = new Int32Array(length + 1);
	const sameHalf = new Int32Array(length + 1);
	for (let i = length - 1; i >= 0; i--) {
		const code = text.charCodeAt(i);
		numeric[i] = code >= 48 && code <= 57 ? numeric[i + 1] + 1 : 0;
		if (code > 255) {
			sameHalf[i] = 0;
			continue;
		}
		const next = i + 1 < length ? text.charCodeAt(i + 1) : -1;
		const together = next >= 0 && next <= 255 && next >= 128 === code >= 128;
		sameHalf[i] = together ? sameHalf[i + 1] + 1 : 1;
	}
	return {
		numeric,
		sameHalf
	};
}
function autoEncode(text) {
	const { numeric, sameHalf } = runsFrom(text);
	
	const codes = [];
	let pos = 0;
	
	
	
	
	const numericRun = numeric[0];
	if (numericRun >= 4 || numericRun === 2 && text.length === 2) {
		codes.push(START_C);
		pos = encodeCodeC(text, pos, codes);
	} else {
		codes.push(START_B);
	}
	let currentSet = codes[0] === START_C ? "C" : "B";
	
	let extended = false;
	while (pos < text.length) {
		if (currentSet === "C") {
			
			const remaining = numeric[pos];
			if (remaining >= 2) {
				pos = encodeCodeC(text, pos, codes);
			} else {
				codes.push(CODE_B);
				currentSet = "B";
			}
		} else {
			
			const numRun = numeric[pos];
			const runsToEnd = pos + numRun >= text.length;
			const worthSwitching = numRun >= 6 || numRun >= 4 && runsToEnd;
			
			
			if (worthSwitching && numRun % 2 === 0) {
				codes.push(CODE_C);
				currentSet = "C";
				pos = encodeCodeC(text, pos, codes);
			} else {
				const charCode = text.charCodeAt(pos);
				if (charCode > 255) {
					throw new InvalidInputError(`Character at position ${pos} (code ${charCode}) is not encodable in Code 128`);
				}
				
				
				
				
				
				const upper = charCode >= 128;
				const value = upper ? charCode - 128 : charCode;
				const run = sameHalf[pos];
				const exit = pos + run >= text.length ? 0 : Math.min(2, sameHalf[pos + run]);
				const latch = upper !== extended && run > 2 + exit;
				const emitFNC4 = () => {
					if (upper === extended) return;
					const fnc4 = currentSet === "A" ? FNC4_A : FNC4_B;
					codes.push(fnc4);
					if (latch) {
						codes.push(fnc4);
						extended = upper;
					}
				};
				if (value >= 32) {
					
					if (currentSet === "A") {
						codes.push(CODE_B);
						currentSet = "B";
					}
					emitFNC4();
					codes.push(value - 32);
				} else {
					
					
					
					if (currentSet !== "A") {
						const nextCharCode = pos + 1 < text.length ? text.charCodeAt(pos + 1) : -1;
						
						
						
						
						
						
						if (!upper && !extended && nextCharCode >= 32 && nextCharCode <= 126) {
							
							codes.push(SHIFT);
							codes.push(value + 64);
							
							pos++;
							continue;
						}
						
						codes.push(CODE_A);
						currentSet = "A";
					}
					emitFNC4();
					codes.push(value + 64);
				}
				pos++;
			}
		}
	}
	
	let checksum = codes[0];
	for (let i = 1; i < codes.length; i++) {
		checksum += codes[i] * i;
	}
	codes.push(checksum % 103);
	return codes;
}
function encodeCodeC(text, pos, codes) {
	while (pos + 1 < text.length) {
		const d1 = text.charCodeAt(pos) - 48;
		const d2 = text.charCodeAt(pos + 1) - 48;
		if (d1 < 0 || d1 > 9 || d2 < 0 || d2 > 9) break;
		codes.push(d1 * 10 + d2);
		pos += 2;
	}
	return pos;
}

function appendChecksum(codes) {
	let checksum = codes[0];
	for (let i = 1; i < codes.length; i++) {
		checksum += codes[i] * i;
	}
	codes.push(checksum % 103);
}

function encodeCharsetA(text) {
	const codes = [START_A];
	for (let i = 0; i < text.length; i++) {
		const charCode = text.charCodeAt(i);
		if (charCode >= 0 && charCode < 32) {
			
			codes.push(charCode + 64);
		} else if (charCode >= 32 && charCode <= 95) {
			
			codes.push(charCode - 32);
		} else {
			throw new InvalidInputError(`Character '${text[i]}' (code ${charCode}) is not encodable in Code 128A. ` + `Code 128A supports control characters (0-31) and printable ASCII 32-95 (uppercase, digits, symbols).`);
		}
	}
	appendChecksum(codes);
	return codes;
}

function encodeCharsetB(text) {
	const codes = [START_B];
	for (let i = 0; i < text.length; i++) {
		const charCode = text.charCodeAt(i);
		if (charCode >= 32 && charCode <= 127) {
			
			codes.push(charCode - 32);
		} else {
			throw new InvalidInputError(`Character code ${charCode} is not encodable in Code 128B. ` + `Code 128B supports printable ASCII characters (32-127).`);
		}
	}
	appendChecksum(codes);
	return codes;
}

function encodeCharsetC(text) {
	
	for (let i = 0; i < text.length; i++) {
		const c = text.charCodeAt(i);
		if (c < 48 || c > 57) {
			throw new InvalidInputError(`Character '${text[i]}' is not encodable in Code 128C. ` + `Code 128C supports only digits (0-9).`);
		}
	}
	
	if (text.length % 2 !== 0) {
		throw new InvalidInputError(`Code 128C requires an even number of digits, got ${text.length}.`);
	}
	const codes = [START_C];
	for (let i = 0; i < text.length; i += 2) {
		const d1 = text.charCodeAt(i) - 48;
		const d2 = text.charCodeAt(i + 1) - 48;
		codes.push(d1 * 10 + d2);
	}
	appendChecksum(codes);
	return codes;
}
