import type { ExpectedResult } from "../types.js";

/**
 * Calculate Precision@K metric
 * P@K = (number of relevant results in top K) / K
 *
 * @param results - Ranked search results
 * @param expectedResults - Ground truth relevant results
 * @param k - Number of top results to consider
 * @returns Precision score between 0 and 1
 */
export function calculatePrecisionAtK(
	results: Array<{ file: string; lineRange?: [number, number] }>,
	expectedResults: ExpectedResult[],
	k: number,
): number {
	if (k <= 0 || results.length === 0) {
		return 0;
	}

	const topK = results.slice(0, k);
	const relevantCount = topK.filter((result) =>
		isRelevant(result, expectedResults),
	).length;

	return relevantCount / k;
}

/**
 * Calculate Precision@K for multiple K values
 */
export function calculatePrecisionAtKs(
	results: Array<{ file: string; lineRange?: [number, number] }>,
	expectedResults: ExpectedResult[],
	kValues: number[] = [1, 3, 5, 10],
): Record<number, number> {
	const metrics: Record<number, number> = {};
	for (const k of kValues) {
		metrics[k] = calculatePrecisionAtK(results, expectedResults, k);
	}
	return metrics;
}

/**
 * Calculate Recall@K metric
 * R@K = (number of relevant results in top K) / (total number of relevant results)
 *
 * @param results - Ranked search results
 * @param expectedResults - Ground truth relevant results
 * @param k - Number of top results to consider
 * @returns Recall score between 0 and 1
 */
export function calculateRecallAtK(
	results: Array<{ file: string; lineRange?: [number, number] }>,
	expectedResults: ExpectedResult[],
	k: number,
): number {
	const totalRelevant = expectedResults.filter((exp) => exp.relevance > 0).length;
	if (totalRelevant === 0) {
		return 0;
	}

	const topK = results.slice(0, k);
	const relevantCount = topK.filter((result) =>
		isRelevant(result, expectedResults),
	).length;

	return relevantCount / totalRelevant;
}

/**
 * Calculate Recall@K for multiple K values
 */
export function calculateRecallAtKs(
	results: Array<{ file: string; lineRange?: [number, number] }>,
	expectedResults: ExpectedResult[],
	kValues: number[] = [1, 3, 5, 10],
): Record<number, number> {
	const metrics: Record<number, number> = {};
	for (const k of kValues) {
		metrics[k] = calculateRecallAtK(results, expectedResults, k);
	}
	return metrics;
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
