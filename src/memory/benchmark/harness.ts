import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setupCorpus } from "./fixtures/loader.js";
import { aggregateResults } from "./metrics/aggregator.js";
import { calculateMRR } from "./metrics/mrr.js";
import { calculatePrecisionAtKs, calculateRecallAtKs } from "./metrics/precision-recall.js";
import type { Strategy } from "./strategies/base.js";
import type { TestCase, TestCaseResult, BenchmarkResult, QueryMetrics } from "./types.js";

/**
 * Main test harness for running memory retrieval benchmarks
 */
export class BenchmarkHarness {
  constructor(
    private strategy: Strategy,
    private corpusDir: string,
  ) {}

  /**
   * Run a single test case
   */
  async runTestCase(testCase: TestCase): Promise<TestCaseResult> {
    const workspaceDir = await mkdtemp(path.join(tmpdir(), "openclaw-benchmark-"));

    try {
      await setupCorpus(this.corpusDir, workspaceDir, testCase);

      await this.strategy.initialize(workspaceDir);

      const startTime = performance.now();
      const results = await this.strategy.search(testCase.query, testCase.id);
      const endTime = performance.now();

      const metrics = this.calculateMetrics(results, testCase);

      return {
        testCaseId: testCase.id,
        query: testCase.query,
        category: testCase.category,
        results,
        metrics,
        executionTimeMs: endTime - startTime,
      };
    } catch (error) {
      return {
        testCaseId: testCase.id,
        query: testCase.query,
        category: testCase.category,
        results: [],
        metrics: {
          precisionAtK: {},
          recallAtK: {},
          mrr: 0,
          totalRelevant: testCase.expectedResults.length,
          totalReturned: 0,
        },
        executionTimeMs: 0,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await this.strategy.close();
      await rm(workspaceDir, { recursive: true, force: true });
    }
  }

  /**
   * Run all test cases and return aggregated results
   */
  async runAll(testCases: TestCase[]): Promise<BenchmarkResult> {
    const results: TestCaseResult[] = [];

    for (const testCase of testCases) {
      const result = await this.runTestCase(testCase);
      results.push(result);
    }

    const summary = aggregateResults(results);

    return {
      strategy: this.strategy.name,
      config: this.strategy.config,
      testCases: results,
      summary,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate all metrics for a test case result
   */
  private calculateMetrics(
    results: Array<{ file: string; lineRange: [number, number] }>,
    testCase: TestCase,
  ): QueryMetrics {
    const kValues = [1, 3, 5, 10];

    return {
      precisionAtK: calculatePrecisionAtKs(results, testCase.expectedResults, kValues),
      recallAtK: calculateRecallAtKs(results, testCase.expectedResults, kValues),
      mrr: calculateMRR(results, testCase.expectedResults),
      totalRelevant: testCase.expectedResults.filter((r) => r.relevance > 0).length,
      totalReturned: results.length,
    };
  }
}

/**
 * Create a benchmark harness for a strategy
 */
export async function createBenchmarkHarness(
  strategy: Strategy,
  corpusDir: string,
): Promise<BenchmarkHarness> {
  return new BenchmarkHarness(strategy, corpusDir);
}
