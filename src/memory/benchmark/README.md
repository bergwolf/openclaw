# Memory Retrieval Quality Benchmark

A test harness for measuring and comparing the effectiveness of memory retrieval strategies in OpenClaw.

## Overview

This benchmark tool evaluates how well different retrieval strategies surface relevant memory snippets in response to queries. It uses real memory files and ground-truth test cases to calculate standard Information Retrieval (IR) metrics.

## Quick Start

### Run the default benchmark

```bash
# From openclaw root
pnpm tsx src/memory/benchmark/cli.ts run

# Or using the shorthand
node --loader tsx src/memory/benchmark/cli.ts run
```

### Compare multiple strategies

```bash
pnpm tsx src/memory/benchmark/cli.ts compare \
  --strategies baseline vector-only keyword-only balanced
```

### Export results

```bash
# JSON format
pnpm tsx src/memory/benchmark/cli.ts run --format json --output results.json

# CSV format for spreadsheet analysis
pnpm tsx src/memory/benchmark/cli.ts run --format csv --output results.csv
```

## CLI Commands

### `run`

Run benchmarks with a specific strategy.

**Options:**
- `-s, --strategy <name>` - Strategy to test (default: `current-baseline`)
- `-t, --test-cases <path>` - Path to test manifest JSON (default: built-in fixtures)
- `-c, --corpus <path>` - Path to corpus directory (default: built-in fixtures)
- `-f, --format <format>` - Output format: `console`, `json`, or `csv` (default: `console`)
- `-o, --output <path>` - Output file path (required for json/csv formats)

**Example:**
```bash
pnpm tsx src/memory/benchmark/cli.ts run \
  --strategy with-mmr \
  --format json \
  --output results-mmr.json
```

### `compare`

Compare multiple strategies side-by-side.

**Options:**
- `-t, --test-cases <path>` - Path to test manifest JSON
- `-c, --corpus <path>` - Path to corpus directory
- `-s, --strategies <names...>` - Space-separated list of strategies
- `-o, --output <path>` - Output JSON file for comparison

**Example:**
```bash
pnpm tsx src/memory/benchmark/cli.ts compare \
  --strategies baseline balanced with-mmr \
  --output comparison.json
```

### `list-strategies`

List all available retrieval strategies.

```bash
pnpm tsx src/memory/benchmark/cli.ts list-strategies
```

## Available Strategies

| Strategy | Description |
|----------|-------------|
| `current-baseline` | Production baseline: 70% vector, 30% BM25 text |
| `baseline` | Alias for current-baseline |
| `vector-only` | Pure vector/semantic search (100% vector) |
| `keyword-only` | Pure BM25 keyword search (100% text) |
| `balanced` | Balanced hybrid (50% vector, 50% text) |
| `with-mmr` | Baseline + MMR diversity re-ranking |
| `with-decay` | Baseline + temporal decay (30-day half-life) |

## Metrics

The benchmark calculates standard IR metrics:

### Precision@K
**P@K = (relevant results in top K) / K**

Measures the proportion of retrieved results that are actually relevant. Higher is better.

- P@1: Precision of the very first result
- P@5: Precision of the top 5 results
- P@10: Precision of the top 10 results

### Recall@K
**R@K = (relevant results in top K) / (total relevant results)**

Measures what fraction of all relevant results were retrieved in the top K. Higher is better.

### Mean Reciprocal Rank (MRR)
**MRR = 1 / rank_of_first_relevant_result**

Measures how quickly users find a relevant result. Values range from 0 (no relevant results) to 1.0 (first result is relevant).

## Adding Test Cases

Test cases are defined in JSON manifests following this schema:

```json
{
  "version": "1.0.0",
  "name": "My Test Suite",
  "description": "Tests for specific scenarios",
  "testCases": [
    {
      "id": "unique-test-id",
      "description": "Human-readable description",
      "query": "What is our caching strategy?",
      "category": "factual",
      "corpus": ["decisions.md", "architecture.md"],
      "expectedResults": [
        {
          "file": "decisions.md",
          "snippetContains": "Redis",
          "relevance": 1.0
        }
      ]
    }
  ]
}
```

### Schema Fields

- **id**: Unique identifier (kebab-case recommended)
- **query**: The search query to execute
- **category**: Optional grouping (e.g., "factual", "conceptual", "temporal")
- **corpus**: Array of memory file paths to search
- **expectedResults**: Array of expected relevant results
  - **file**: Path to file containing relevant content
  - **snippetContains**: Optional substring that should appear
  - **lineRange**: Optional `[startLine, endLine]` for precise matching
  - **relevance**: Score from 0 (irrelevant) to 1 (highly relevant)

### Test Case Categories

Organize tests by query type:

- **factual**: Specific facts (ports, config values, dates)
- **conceptual**: Understanding decisions (why, how, what)
- **temporal**: Recent changes or time-based queries
- **technical**: Implementation details
- **comparative**: Alternatives evaluation
- **negative**: Queries with no relevant results (tests precision)

## Creating Custom Strategies

Implement the `Strategy` interface:

```typescript
import type { Strategy, StrategyConfig } from "./strategies/base.js";

export class MyCustomStrategy implements Strategy {
  readonly name = "my-strategy";
  readonly description = "My custom retrieval approach";
  readonly config: StrategyConfig;

  constructor(config: StrategyConfig = {}) {
    this.config = config;
  }

  async initialize(workspaceDir: string): Promise<void> {
    // Setup your strategy
  }

  async search(query: string): Promise<SearchResult[]> {
    // Implement your retrieval logic
    return [];
  }

  async close(): Promise<void> {
    // Cleanup
  }
}
```

Register it in `strategies/registry.ts`:

```typescript
this.register("my-strategy", async (config) => new MyCustomStrategy(config));
```

## Using Real Memory Files

To benchmark against your own memory files:

1. **Anonymize sensitive data:**

```typescript
import { anonymizeDirectory } from "./fixtures/anonymize-memory.js";

await anonymizeDirectory(
  "/path/to/real/memory",
  "/path/to/anonymized/output",
  {
    domains: ["yourcompany.com"],
    names: ["John Doe", "Jane Smith"],
  }
);
```

2. **Create test manifest** pointing to anonymized files

3. **Run benchmark:**

```bash
pnpm tsx src/memory/benchmark/cli.ts run \
  --corpus /path/to/anonymized/output \
  --test-cases my-test-cases.json
```

## Interpreting Results

### Good Performance Indicators
- **P@5 > 80%**: Most top results are relevant
- **R@5 > 60%**: Captures majority of relevant content
- **MRR > 0.7**: First relevant result appears early

### Strategy Selection Guide
- **High precision needed**: Use higher vector weight or enable MMR
- **High recall needed**: Increase `maxResults`, lower `minScore`
- **Recent context matters**: Enable temporal decay
- **Diverse results needed**: Enable MMR re-ranking

## CI Integration

The benchmark can track metric changes over time in CI/CD:

```yaml
# .github/workflows/memory-benchmark.yml
name: Memory Benchmark

on: [pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm tsx src/memory/benchmark/cli.ts run --format json --output benchmark-results.json
      - uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: benchmark-results.json
```

## Architecture

```
src/memory/benchmark/
├── cli.ts                      # CLI entry point
├── harness.ts                  # Core test execution engine
├── types.ts                    # TypeScript type definitions
├── config-builder.ts           # Config generation utilities
├── strategies/
│   ├── base.ts                # Strategy interface
│   ├── current.ts             # Baseline implementation
│   └── registry.ts            # Strategy loader
├── metrics/
│   ├── precision-recall.ts    # P@K, R@K calculators
│   ├── mrr.ts                 # Mean Reciprocal Rank
│   └── aggregator.ts          # Summary statistics
├── reporters/
│   ├── console.ts             # Terminal output
│   ├── json.ts                # JSON export
│   └── csv.ts                 # CSV export
├── fixtures/
│   ├── anonymize-memory.ts    # Anonymization utility
│   ├── loader.ts              # Test manifest loader
│   ├── test-cases.json        # Default test suite
│   └── corpus/                # Sample memory files
└── benchmark.test.ts          # Unit tests
```

## Future Enhancements

- NDCG (Normalized Discounted Cumulative Gain) with graded relevance
- Statistical significance testing (t-tests, bootstrap confidence intervals)
- A/B testing framework for live retrieval
- Automated test case generation from session logs
- Graph-based memory retrieval comparison
- Query variation testing (paraphrase robustness)

## License

Same as OpenClaw main project.
