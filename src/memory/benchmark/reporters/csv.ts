import type { BenchmarkResult } from "../types.js";
import { writeFile } from "node:fs/promises";

export async function reportToCSV(
	result: BenchmarkResult,
	outputPath: string,
): Promise<void> {
	const csv = toCSV(result);
	await writeFile(outputPath, csv, "utf-8");
}

export function toCSV(result: BenchmarkResult): string {
	const headers = [
		"test_id",
		"category",
		"query",
		"strategy",
		"p@1",
		"p@3",
		"p@5",
		"p@10",
		"r@1",
		"r@3",
		"r@5",
		"r@10",
		"mrr",
		"execution_time_ms",
		"error",
	];

	const rows = [headers.join(",")];

	for (const testCase of result.testCases) {
		const row = [
			escapeCSV(testCase.testCaseId),
			escapeCSV(testCase.category || ""),
			escapeCSV(testCase.query),
			escapeCSV(result.strategy),
			testCase.metrics.precisionAtK[1]?.toFixed(4) || "0",
			testCase.metrics.precisionAtK[3]?.toFixed(4) || "0",
			testCase.metrics.precisionAtK[5]?.toFixed(4) || "0",
			testCase.metrics.precisionAtK[10]?.toFixed(4) || "0",
			testCase.metrics.recallAtK[1]?.toFixed(4) || "0",
			testCase.metrics.recallAtK[3]?.toFixed(4) || "0",
			testCase.metrics.recallAtK[5]?.toFixed(4) || "0",
			testCase.metrics.recallAtK[10]?.toFixed(4) || "0",
			testCase.metrics.mrr.toFixed(4),
			testCase.executionTimeMs.toFixed(2),
			escapeCSV(testCase.error || ""),
		];
		rows.push(row.join(","));
	}

	return rows.join("\n");
}

function escapeCSV(value: string): string {
	if (value.includes(",") || value.includes('"') || value.includes("\n")) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
