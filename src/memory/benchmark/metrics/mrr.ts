import type { ExpectedResult } from "../types.js";

/**
 * Calculate Mean Reciprocal Rank (MRR)
 * MRR = 1 / rank_of_first_relevant_result
 *
 * @param results - Ranked search results
 * @param expectedResults - Ground truth relevant results
 * @returns MRR score (0 if no relevant results found)
 */
export function calculateMRR(
	results: Array<{ file: string; lineRange?: [number, number] }>,
	expectedResults: ExpectedResult[],
): number {
	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		if (isRelevant(result, expectedResults)) {
			return 1 / (i + 1);
		}
	}
	return 0;
}

/**
 * Check if a result matches any expected result
 */
function isRelevant(
	result: { file: string; lineRange?: [number, number] },
	expectedResults: ExpectedResult[],
): boolean {
	return expectedResults.some((expected) => {
		if (result.file !== expected.file) {
			return false;
		}

		if (!expected.lineRange || !result.lineRange) {
			return true;
		}

		const [expStart, expEnd] = expected.lineRange;
		const [resStart, resEnd] = result.lineRange;
		return resStart <= expEnd && resEnd >= expStart;
	});
}
