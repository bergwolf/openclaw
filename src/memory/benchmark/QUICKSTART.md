# Memory Benchmark Quick Start

## Install & Run (3 steps)

### 1. Navigate to openclaw directory
```bash
cd /code/openclaw
```

### 2. Run the benchmark
```bash
# Using Node with tsx loader
node --loader tsx src/memory/benchmark/cli.ts run

# Or if pnpm is available
pnpm tsx src/memory/benchmark/cli.ts run
```

### 3. View results
The benchmark will output a table showing:
- Precision@K and Recall@K for different K values
- Mean Reciprocal Rank (MRR)
- Per-test-case results

## Compare Strategies

Compare multiple retrieval strategies side-by-side:

```bash
node --loader tsx src/memory/benchmark/cli.ts compare \
  --strategies baseline vector-only keyword-only balanced
```

## List Available Strategies

```bash
node --loader tsx src/memory/benchmark/cli.ts list-strategies
```

Output:
- `current-baseline` - Production baseline (70% vector, 30% text)
- `baseline` - Alias for current-baseline
- `vector-only` - Pure semantic search
- `keyword-only` - Pure BM25 keyword search
- `balanced` - 50/50 hybrid
- `with-mmr` - Baseline + diversity re-ranking
- `with-decay` - Baseline + temporal decay

## Export Results

### JSON format (for programmatic analysis)
```bash
node --loader tsx src/memory/benchmark/cli.ts run \
  --format json \
  --output results.json
```

### CSV format (for spreadsheets)
```bash
node --loader tsx src/memory/benchmark/cli.ts run \
  --format csv \
  --output results.csv
```

## Understanding the Output

### Key Metrics

**Precision@5**: Of the top 5 results, what % are relevant?
- Higher is better (80%+ is excellent)

**Recall@5**: Of all relevant results, what % are in top 5?
- Higher is better (60%+ is good)

**MRR (Mean Reciprocal Rank)**: How quickly do users find relevant results?
- Range: 0 (never found) to 1.0 (first result)
- 0.7+ is excellent

### Sample Output
```
Memory Retrieval Benchmark Results
Strategy: current-baseline
Timestamp: 2026-03-10T09:14:32.123Z

Summary Statistics
────────────────────────────────────────────────────────
Metric          K=1    K=3    K=5    K=10
Precision (avg) 73.3%  80.0%  76.0%  65.0%
Recall (avg)    46.7%  66.7%  73.3%  80.0%

MRR (avg): 0.867 | MRR (median): 1.000

Per-Test-Case Results
────────────────────────────────────────────────────────
Test ID              Category    P@5    R@5    MRR    Status
factual-jwt-auth     factual    100.0% 100.0% 1.000   OK
factual-api-port     factual     80.0%  80.0% 1.000   OK
...

✓ 15/15 test cases completed successfully
```

## Next Steps

1. **Run baseline** to see current performance
2. **Compare strategies** to find the best configuration
3. **Add test cases** from your real usage patterns
4. **Implement custom strategies** for your specific needs

See `README.md` for complete documentation.
