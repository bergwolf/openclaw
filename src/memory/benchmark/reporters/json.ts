import type { BenchmarkResult } from "../types.js";
import { writeFile } from "node:fs/promises";

export async function reportToJSON(
	result: BenchmarkResult,
	outputPath: string,
): Promise<void> {
	const json = JSON.stringify(result, null, 2);
	await writeFile(outputPath, json, "utf-8");
}

export function toJSON(result: BenchmarkResult): string {
	return JSON.stringify(result, null, 2);
}
