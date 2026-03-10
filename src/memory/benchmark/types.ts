/**
 * Test manifest schema for memory retrieval quality evaluation
 */

export interface ExpectedResult {
	/** File path relative to workspace/memory directory */
	file: string;
	/** Substring that should appear in the matched snippet */
	snippetContains?: string;
	/** Line numbers that should be included (optional) */
	lineRange?: [number, number];
	/** Relevance score: 0 (not relevant) to 1 (highly relevant) */
	relevance: number;
}

export interface TestCase {
	/** Unique identifier for this test case */
	id: string;
	/** Human-readable description */
	description?: string;
	/** Search query to execute */
	query: string;
	/** Category for grouping (e.g., "factual", "conceptual", "temporal") */
	category?: string;
	/** Memory files to include in the search corpus */
	corpus: string[];
	/** Expected results with relevance scores */
	expectedResults: ExpectedResult[];
	/** Optional metadata */
	metadata?: Record<string, unknown>;
}

export interface TestManifest {
	/** Schema version for compatibility checking */
	version: string;
	/** Human-readable name for this test suite */
	name: string;
	/** Description of what this test suite covers */
	description?: string;
	/** Test cases in this manifest */
	testCases: TestCase[];
}

export interface SearchResult {
	/** File path of the result */
	file: string;
	/** Line range of the matched chunk */
	lineRange: [number, number];
	/** Snippet text */
	snippet: string;
	/** Relevance score from the search engine */
	score: number;
}

export interface QueryMetrics {
	/** Precision at K (K=1,3,5,10) */
	precisionAtK: Record<number, number>;
	/** Recall at K (K=1,3,5,10) */
	recallAtK: Record<number, number>;
	/** Mean Reciprocal Rank */
	mrr: number;
	/** Number of expected relevant results */
	totalRelevant: number;
	/** Number of results returned */
	totalReturned: number;
}

export interface TestCaseResult {
	/** Test case ID */
	testCaseId: string;
	/** Query that was executed */
	query: string;
	/** Category */
	category?: string;
	/** Search results returned */
	results: SearchResult[];
	/** Calculated metrics */
	metrics: QueryMetrics;
	/** Execution time in milliseconds */
	executionTimeMs: number;
	/** Any errors encountered */
	error?: string;
}

export interface BenchmarkResult {
	/** Strategy name that was tested */
	strategy: string;
	/** Strategy configuration parameters */
	config: Record<string, unknown>;
	/** Per-test-case results */
	testCases: TestCaseResult[];
	/** Aggregated summary statistics */
	summary: {
		/** Average metrics across all test cases */
		averages: {
			precisionAtK: Record<number, number>;
			recallAtK: Record<number, number>;
			mrr: number;
		};
		/** Median metrics */
		medians: {
			precisionAtK: Record<number, number>;
			recallAtK: Record<number, number>;
			mrr: number;
		};
		/** Total execution time */
		totalTimeMs: number;
		/** Number of test cases run */
		totalTests: number;
		/** Number of errors */
		errorCount: number;
	};
	/** When the benchmark was run */
	timestamp: string;
}
