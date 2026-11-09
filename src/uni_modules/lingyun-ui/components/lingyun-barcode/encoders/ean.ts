// @ts-nocheck
/**
 * Vendored from etiket 1.0.0 — MIT License.
 * Copyright (c) 2026 productdevbook
 * Source: https://github.com/productdevbook/etiket
 * See ../../../THIRD_PARTY_NOTICES.md for the full license text.
 */

import { InvalidInputError, CheckDigitError } from './errors'

export function eanDigits(text, symbology) {
	const digits = [];
	for (const character of text) {
		if (character === " " || character === "-") continue;
		if (character < "0" || character > "9") {
			throw new InvalidInputError(`${symbology} accepts digits, spaces and hyphens only (got '${character}')`);
		}
		digits.push(character.charCodeAt(0) - 48);
	}
	return digits;
}


const L_PATTERNS = [
	[
		3,
		2,
		1,
		1
	],
	[
		2,
		2,
		2,
		1
	],
	[
		2,
		1,
		2,
		2
	],
	[
		1,
		4,
		1,
		1
	],
	[
		1,
		1,
		3,
		2
	],
	[
		1,
		2,
		3,
		1
	],
	[
		1,
		1,
		1,
		4
	],
	[
		1,
		3,
		1,
		2
	],
	[
		1,
		2,
		1,
		3
	],
	[
		3,
		1,
		1,
		2
	]
];
const R_PATTERNS = [
	[
		3,
		2,
		1,
		1
	],
	[
		2,
		2,
		2,
		1
	],
	[
		2,
		1,
		2,
		2
	],
	[
		1,
		4,
		1,
		1
	],
	[
		1,
		1,
		3,
		2
	],
	[
		1,
		2,
		3,
		1
	],
	[
		1,
		1,
		1,
		4
	],
	[
		1,
		3,
		1,
		2
	],
	[
		1,
		2,
		1,
		3
	],
	[
		3,
		1,
		1,
		2
	]
];

const G_PATTERNS = [
	[
		1,
		1,
		2,
		3
	],
	[
		1,
		2,
		2,
		2
	],
	[
		2,
		2,
		1,
		2
	],
	[
		1,
		1,
		4,
		1
	],
	[
		2,
		3,
		1,
		1
	],
	[
		1,
		3,
		2,
		1
	],
	[
		4,
		1,
		1,
		1
	],
	[
		2,
		1,
		3,
		1
	],
	[
		3,
		1,
		2,
		1
	],
	[
		2,
		1,
		1,
		3
	]
];


const FIRST_DIGIT_ENCODING = [
	[
		0,
		0,
		0,
		0,
		0,
		0
	],
	[
		0,
		0,
		1,
		0,
		1,
		1
	],
	[
		0,
		0,
		1,
		1,
		0,
		1
	],
	[
		0,
		0,
		1,
		1,
		1,
		0
	],
	[
		0,
		1,
		0,
		0,
		1,
		1
	],
	[
		0,
		1,
		1,
		0,
		0,
		1
	],
	[
		0,
		1,
		1,
		1,
		0,
		0
	],
	[
		0,
		1,
		0,
		1,
		0,
		1
	],
	[
		0,
		1,
		0,
		1,
		1,
		0
	],
	[
		0,
		1,
		1,
		0,
		1,
		0
	]
];
const GUARD_START = [
	1,
	1,
	1
];
const GUARD_CENTER = [
	1,
	1,
	1,
	1,
	1
];
const GUARD_END = [
	1,
	1,
	1
];


function calculateCheckDigit(digits) {
	let sum = 0;
	for (let i = 0; i < digits.length; i++) {
		const fromEnd = digits.length - 1 - i;
		sum += digits[i] * (fromEnd % 2 === 0 ? 3 : 1);
	}
	return (10 - sum % 10) % 10;
}

export function encodeEAN13(text) {
	const digits = eanDigits(text, "EAN-13");
	if (digits.length === 12) {
		digits.push(calculateCheckDigit(digits));
	} else if (digits.length === 13) {
		const expected = calculateCheckDigit(digits.slice(0, 12));
		if (digits[12] !== expected) {
			throw new CheckDigitError(`EAN-13 check digit mismatch: expected ${expected}, got ${digits[12]}`);
		}
	} else {
		throw new InvalidInputError("EAN-13 requires 12 or 13 digits");
	}
	const firstDigit = digits[0];
	const encoding = FIRST_DIGIT_ENCODING[firstDigit];
	const bars = [];
	const guards = [];
	
	let pos = 0;
	guards.push(pos);
	for (const w of GUARD_START) {
		bars.push(w);
		pos++;
	}
	
	for (let i = 0; i < 6; i++) {
		const digit = digits[i + 1];
		const pattern = encoding[i] === 0 ? L_PATTERNS[digit] : G_PATTERNS[digit];
		for (const w of pattern) {
			bars.push(w);
			pos++;
		}
	}
	
	guards.push(pos);
	for (const w of GUARD_CENTER) {
		bars.push(w);
		pos++;
	}
	
	for (let i = 0; i < 6; i++) {
		const digit = digits[i + 7];
		const pattern = R_PATTERNS[digit];
		for (const w of pattern) {
			bars.push(w);
			pos++;
		}
	}
	
	guards.push(pos);
	for (const w of GUARD_END) {
		bars.push(w);
		pos++;
	}
	return {
		bars,
		guards,
		digits: digits.join("")
	};
}

export function encodeEAN8(text) {
	const digits = eanDigits(text, "EAN-8");
	if (digits.length === 7) {
		digits.push(calculateCheckDigit(digits));
	} else if (digits.length === 8) {
		const expected = calculateCheckDigit(digits.slice(0, 7));
		if (digits[7] !== expected) {
			throw new CheckDigitError(`EAN-8 check digit mismatch: expected ${expected}, got ${digits[7]}`);
		}
	} else {
		throw new InvalidInputError("EAN-8 requires 7 or 8 digits");
	}
	const bars = [];
	const guards = [];
	
	let pos = 0;
	guards.push(pos);
	for (const w of GUARD_START) {
		bars.push(w);
		pos++;
	}
	
	for (let i = 0; i < 4; i++) {
		const digit = digits[i];
		const pattern = L_PATTERNS[digit];
		for (const w of pattern) {
			bars.push(w);
			pos++;
		}
	}
	
	guards.push(pos);
	for (const w of GUARD_CENTER) {
		bars.push(w);
		pos++;
	}
	
	for (let i = 0; i < 4; i++) {
		const digit = digits[i + 4];
		const pattern = R_PATTERNS[digit];
		for (const w of pattern) {
			bars.push(w);
			pos++;
		}
	}
	
	guards.push(pos);
	for (const w of GUARD_END) {
		bars.push(w);
		pos++;
	}
	return {
		bars,
		guards,
		digits: digits.join("")
	};
}
