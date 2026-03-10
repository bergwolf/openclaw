import { describe, it, expect } from "vitest";
import { calculatePrecisionAtK, calculateRecallAtK } from "./metrics/precision-recall.js";
import { calculateMRR } from "./metrics/mrr.js";
import { aggregateResults } from "./metrics/aggregator.js";
import type { TestCaseResult, ExpectedResult } from "./types.js";

describe("Precision@K", () => {
	it("calculates precision correctly", () => {
		const results = [
			{ file: "a.md", lineRange: [1, 10] as [number, number] },
			{ file: "b.md", lineRange: [1, 10] as [number, number] },
			{ file: "c.md", lineRange: [1, 10] as [number, number] },
		];

		const expected: ExpectedResult[] = [
			{ file: "a.md", relevance: 1.0 },
			{ file: "b.md", relevance: 1.0 },
		];

		expect(calculatePrecisionAtK(results, expected, 2)).toBe(1.0);
		expect(calculatePrecisionAtK(results, expected, 3)).toBeCloseTo(0.667, 2);
	});

	it("returns 0 for no results", () => {
		expect(calculatePrecisionAtK([], [], 5)).toBe(0);
	});
});

describe("Recall@K", () => {
	it("calculates recall correctly", () => {
		const results = [
			{ file: "a.md", lineRange: [1, 10] as [number, number] },
			{ file: "b.md", lineRange: [1, 10] as [number, number] },
		];

		const expected: ExpectedResult[] = [
			{ file: "a.md", relevance: 1.0 },
			{ file: "b.md", relevance: 1.0 },
			{ file: "c.md", relevance: 1.0 },
		];

		expect(calculateRecallAtK(results, expected, 2)).toBeCloseTo(0.667, 2);
		expect(calculateRecallAtK(results, expected, 5)).toBeCloseTo(0.667, 2);
	});

	it("returns 0 when no relevant results exist", () => {
		const results = [{ file: "a.md", lineRange: [1, 10] as [number, number] }];
		expect(calculateRecallAtK(results, [], 5)).toBe(0);
	});
});

describe("MRR", () => {
	it("calculates MRR correctly", () => {
		const results = [
			{ file: "a.md", lineRange: [1, 10] as [number, number] },
			{ file: "b.md", lineRange: [1, 10] as [number, number] },
			{ file: "c.md", lineRange: [1, 10] as [number, number] },
		];

		const expected: ExpectedResult[] = [{ file: "b.md", relevance: 1.0 }];

		expect(calculateMRR(results, expected)).toBe(0.5);
	});

	it("returns 0 when no relevant results found", () => {
		const results = [{ file: "a.md", lineRange: [1, 10] as [number, number] }];
		const expected: ExpectedResult[] = [{ file: "b.md", relevance: 1.0 }];

		expect(calculateMRR(results, expected)).toBe(0);
	});

	it("returns 1 when first result is relevant", () => {
		const results = [{ file: "a.md", lineRange: [1, 10] as [number, number] }];
		const expected: ExpectedResult[] = [{ file: "a.md", relevance: 1.0 }];

		expect(calculateMRR(results, expected)).toBe(1.0);
	});
});

describe("Results Aggregator", () => {
	it("aggregates metrics correctly", () => {
		const testCases: TestCaseResult[] = [
			{
				testCaseId: "test1",
				query: "q1",
				results: [],
				metrics: {
					precisionAtK: { 5: 0.8 },
					recallAtK: { 5: 0.6 },
					mrr: 1.0,
					totalRelevant: 3,
					totalReturned: 5,
				},
				executionTimeMs: 100,
			},
			{
				testCaseId: "test2",
				query: "q2",
				results: [],
				metrics: {
					precisionAtK: { 5: 0.6 },
					recallAtK: { 5: 0.4 },
					mrr: 0.5,
					totalRelevant: 2,
					totalReturned: 5,
				},
				executionTimeMs: 150,
			},
		];

		const summary = aggregateResults(testCases);

		expect(summary.averages.precisionAtK[5]).toBe(0.7);
		expect(summary.averages.recallAtK[5]).toBe(0.5);
		expect(summary.averages.mrr).toBe(0.75);
		expect(summary.totalTimeMs).toBe(250);
		expect(summary.totalTests).toBe(2);
		expect(summary.errorCount).toBe(0);
	});

	it("handles errors correctly", () => {
		const testCases: TestCaseResult[] = [
			{
				testCaseId: "test1",
				query: "q1",
				results: [],
				metrics: {
					precisionAtK: { 5: 0.8 },
					recallAtK: { 5: 0.6 },
					mrr: 1.0,
					totalRelevant: 3,
					totalReturned: 5,
				},
				executionTimeMs: 100,
			},
			{
				testCaseId: "test2",
				query: "q2",
				results: [],
				metrics: {
					precisionAtK: { 5: 0 },
					recallAtK: { 5: 0 },
					mrr: 0,
					totalRelevant: 0,
					totalReturned: 0,
				},
				executionTimeMs: 0,
				error: "Test error",
			},
		];

		const summary = aggregateResults(testCases);

		expect(summary.errorCount).toBe(1);
		expect(summary.totalTests).toBe(2);
		expect(summary.averages.mrr).toBe(1.0);
	});
});
