#!/usr/bin/env node
/**
 * Example: How to use the benchmark harness programmatically
 */

import { createBenchmarkHarness } from "./harness.js";
import { strategyRegistry } from "./strategies/registry.js";
import { loadTestManifest } from "./fixtures/loader.js";
import { reportToConsole } from "./reporters/console.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
	console.log("Memory Benchmark Example\n");

	const corpusDir = path.join(__dirname, "fixtures", "corpus");
	const manifestPath = path.join(__dirname, "fixtures", "test-cases.json");

	const manifest = await loadTestManifest(manifestPath);
	console.log(`Loaded ${manifest.testCases.length} test cases\n`);

	const strategy = await strategyRegistry.create("current-baseline");
	console.log(`Testing strategy: ${strategy.name}`);
	console.log(`${strategy.description}\n`);

	const harness = await createBenchmarkHarness(strategy, corpusDir);
	
	console.log("Running benchmark...\n");
	const result = await harness.runAll(manifest.testCases);

	reportToConsole(result);
}

main().catch((error) => {
	console.error("Error:", error);
	process.exit(1);
});
