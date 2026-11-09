/**
 * Vendored from etiket 1.0.0 — MIT License.
 * Copyright (c) 2026 productdevbook
 * Source: https://github.com/productdevbook/etiket
 * See ../../../THIRD_PARTY_NOTICES.md for the full license text.
 */

export class EtiketError extends Error {
	name = "EtiketError";
}
export class InvalidInputError extends EtiketError {
	name = "InvalidInputError";
}
export class CapacityError extends EtiketError {
	name = "CapacityError";
}

export class CheckDigitError extends InvalidInputError {
	name = "CheckDigitError";
}
