import type { BenchmarkResult } from "../types.js";

function fmt(num: number, decimals = 3): string {
return num.toFixed(decimals);
}

function pct(num: number): string {
return `${(num * 100).toFixed(1)}%`;
}

function simpleTable(rows: string[][]): string {
const colWidths: number[] = [];

for (let col = 0; col < rows[0].length; col++) {
let max = 0;
for (const row of rows) {
if (row[col] && row[col].length > max) max = row[col].length;
}
colWidths.push(max);
}

const lines: string[] = [];
for (let i = 0; i < rows.length; i++) {
const cells = rows[i].map((cell, j) => cell.padEnd(colWidths[j]));
lines.push(cells.join("  "));
if (i === 0) {
lines.push(colWidths.map(w => "─".repeat(w)).join("  "));
}
}
return lines.join("\n");
}

export function reportToConsole(result: BenchmarkResult): void {
console.log("\n=== Memory Retrieval Benchmark Results ===");
console.log(`Strategy: ${result.strategy}`);
console.log(`Timestamp: ${result.timestamp}`);
console.log(`Total execution time: ${result.summary.totalTimeMs.toFixed(0)}ms`);
console.log();

console.log("Summary Statistics");
console.log("─".repeat(60));

const summaryRows = [
["Metric", "K=1", "K=3", "K=5", "K=10"],
[
"Precision (avg)",
pct(result.summary.averages.precisionAtK[1] || 0),
pct(result.summary.averages.precisionAtK[3] || 0),
pct(result.summary.averages.precisionAtK[5] || 0),
pct(result.summary.averages.precisionAtK[10] || 0),
],
[
"Recall (avg)",
pct(result.summary.averages.recallAtK[1] || 0),
pct(result.summary.averages.recallAtK[3] || 0),
pct(result.summary.averages.recallAtK[5] || 0),
pct(result.summary.averages.recallAtK[10] || 0),
],
];

console.log(simpleTable(summaryRows));
console.log(`\nMRR (avg): ${fmt(result.summary.averages.mrr)}`);
console.log();

if (result.summary.errorCount > 0) {
console.log(`⚠ ${result.summary.errorCount} test case(s) failed with errors`);
console.log();
}

console.log("Per-Test-Case Results");
console.log("─".repeat(80));

const detailRows = [["Test ID", "Category", "P@5", "R@5", "MRR", "Status"]];

for (const testCase of result.testCases) {
const status = testCase.error ? "ERROR" : "OK";
detailRows.push([
testCase.testCaseId,
testCase.category || "N/A",
pct(testCase.metrics.precisionAtK[5] || 0),
pct(testCase.metrics.recallAtK[5] || 0),
fmt(testCase.metrics.mrr),
status,
]);
}

console.log(simpleTable(detailRows));
const passedCount = result.summary.totalTests - result.summary.errorCount;
console.log(`\n✓ ${passedCount}/${result.summary.totalTests} tests passed\n`);
}
