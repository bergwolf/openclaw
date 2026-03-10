import type { TestCaseResult, QueryMetrics } from "../types.js";

/**
 * Aggregate metrics from multiple test case results
 */
export function aggregateResults(results: TestCaseResult[]): {
	averages: {
		precisionAtK: Record<number, number>;
		recallAtK: Record<number, number>;
		mrr: number;
	};
	medians: {
		precisionAtK: Record<number, number>;
		recallAtK: Record<number, number>;
		mrr: number;
	};
	totalTimeMs: number;
	totalTests: number;
	errorCount: number;
} {
	if (results.length === 0) {
		return {
			averages: { precisionAtK: {}, recallAtK: {}, mrr: 0 },
			medians: { precisionAtK: {}, recallAtK: {}, mrr: 0 },
			totalTimeMs: 0,
			totalTests: 0,
			errorCount: 0,
		};
	}

	const kValues = Object.keys(results[0].metrics.precisionAtK).map(Number);
	const errorCount = results.filter((r) => r.error).length;
	const validResults = results.filter((r) => !r.error);

	const averages = {
		precisionAtK: calculateAveragesByK(
			validResults.map((r) => r.metrics.precisionAtK),
			kValues,
		),
		recallAtK: calculateAveragesByK(
			validResults.map((r) => r.metrics.recallAtK),
			kValues,
		),
		mrr: average(validResults.map((r) => r.metrics.mrr)),
	};

	const medians = {
		precisionAtK: calculateMediansByK(
			validResults.map((r) => r.metrics.precisionAtK),
			kValues,
		),
		recallAtK: calculateMediansByK(
			validResults.map((r) => r.metrics.recallAtK),
			kValues,
		),
		mrr: median(validResults.map((r) => r.metrics.mrr)),
	};

	const totalTimeMs = results.reduce((sum, r) => sum + r.executionTimeMs, 0);

	return {
		averages,
		medians,
		totalTimeMs,
		totalTests: results.length,
		errorCount,
	};
}

/**
 * Calculate averages for metrics at different K values
 */
function calculateAveragesByK(
	metrics: Array<Record<number, number>>,
	kValues: number[],
): Record<number, number> {
	const result: Record<number, number> = {};

	for (const k of kValues) {
		const values = metrics.map((m) => m[k]).filter((v) => v !== undefined);
		result[k] = average(values);
	}

	return result;
}

/**
 * Calculate medians for metrics at different K values
 */
function calculateMediansByK(
	metrics: Array<Record<number, number>>,
	kValues: number[],
): Record<number, number> {
	const result: Record<number, number> = {};

	for (const k of kValues) {
		const values = metrics.map((m) => m[k]).filter((v) => v !== undefined);
		result[k] = median(values);
	}

	return result;
}

/**
 * Calculate average of numbers
 */
function average(values: number[]): number {
	if (values.length === 0) return 0;
	return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate median of numbers
 */
function median(values: number[]): number {
	if (values.length === 0) return 0;

	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);

	if (sorted.length % 2 === 0) {
		return (sorted[mid - 1] + sorted[mid]) / 2;
	}

	return sorted[mid];
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
	if (values.length === 0) return 0;

	const avg = average(values);
	const squareDiffs = values.map((v) => Math.pow(v - avg, 2));
	const avgSquareDiff = average(squareDiffs);

	return Math.sqrt(avgSquareDiff);
}

/**
 * Group results by category and calculate per-category statistics
 */
export function groupByCategory(
	results: TestCaseResult[],
): Map<string, TestCaseResult[]> {
	const grouped = new Map<string, TestCaseResult[]>();

	for (const result of results) {
		const category = result.category || "uncategorized";
		if (!grouped.has(category)) {
			grouped.set(category, []);
		}
		grouped.get(category)!.push(result);
	}

	return grouped;
}
