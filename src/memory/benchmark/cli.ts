#!/usr/bin/env node
import { Command } from "commander";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { strategyRegistry } from "./strategies/registry.js";
import { createBenchmarkHarness } from "./harness.js";
import { loadTestManifest } from "./fixtures/loader.js";
import { reportToConsole } from "./reporters/console.js";
import { reportToJSON } from "./reporters/json.js";
import { reportToCSV } from "./reporters/csv.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CORPUS_DIR = path.join(__dirname, "fixtures", "corpus");
const DEFAULT_TEST_CASES = path.join(__dirname, "fixtures", "test-cases.json");

const program = new Command();

program
	.name("memory-benchmark")
	.description("Benchmark memory retrieval strategies")
	.version("1.0.0");

program
	.command("run")
	.description("Run benchmark tests")
	.option(
		"-s, --strategy <name>",
		"Strategy to test",
		"current-baseline",
	)
	.option(
		"-t, --test-cases <path>",
		"Path to test cases JSON manifest",
		DEFAULT_TEST_CASES,
	)
	.option(
		"-c, --corpus <path>",
		"Path to corpus directory",
		DEFAULT_CORPUS_DIR,
	)
	.option(
		"-f, --format <format>",
		"Output format (console, json, csv)",
		"console",
	)
	.option("-o, --output <path>", "Output file path (for json/csv formats)")
	.action(async (options) => {
		try {
			const manifest = await loadTestManifest(options.testCases);
			console.log(`Loaded ${manifest.testCases.length} test cases from ${options.testCases}`);

			const strategy = await strategyRegistry.create(options.strategy);
			console.log(`Using strategy: ${strategy.name}`);
			console.log(`Description: ${strategy.description}`);
			console.log();

			const harness = await createBenchmarkHarness(strategy, options.corpus);
			console.log("Running benchmark...");

			const result = await harness.runAll(manifest.testCases);

			switch (options.format) {
				case "console":
					reportToConsole(result);
					break;

				case "json":
					if (!options.output) {
						console.error("Error: --output required for JSON format");
						process.exit(1);
					}
					await reportToJSON(result, options.output);
					console.log(`Results written to ${options.output}`);
					break;

				case "csv":
					if (!options.output) {
						console.error("Error: --output required for CSV format");
						process.exit(1);
					}
					await reportToCSV(result, options.output);
					console.log(`Results written to ${options.output}`);
					break;

				default:
					console.error(`Unknown format: ${options.format}`);
					process.exit(1);
			}
		} catch (error) {
			console.error("Error running benchmark:", error);
			process.exit(1);
		}
	});

program
	.command("list-strategies")
	.description("List available strategies")
	.action(() => {
		const strategies = strategyRegistry.getAvailableStrategies();
		console.log("Available strategies:");
		for (const name of strategies) {
			console.log(`  - ${name}`);
		}
	});

program
	.command("compare")
	.description("Compare multiple strategies")
	.option(
		"-t, --test-cases <path>",
		"Path to test cases JSON manifest",
		DEFAULT_TEST_CASES,
	)
	.option(
		"-c, --corpus <path>",
		"Path to corpus directory",
		DEFAULT_CORPUS_DIR,
	)
	.option(
		"-s, --strategies <names...>",
		"Strategies to compare",
		["baseline", "vector-only", "keyword-only"],
	)
	.option("-o, --output <path>", "Output JSON file for comparison results")
	.action(async (options) => {
		try {
			const manifest = await loadTestManifest(options.testCases);
			const results = [];

			for (const strategyName of options.strategies) {
				console.log(`\nRunning strategy: ${strategyName}`);
				const strategy = await strategyRegistry.create(strategyName);
				const harness = await createBenchmarkHarness(strategy, options.corpus);
				const result = await harness.runAll(manifest.testCases);
				results.push(result);
				console.log(`Completed ${strategyName}`);
			}

			if (options.output) {
				await reportToJSON({ comparison: results } as any, options.output);
				console.log(`\nComparison results written to ${options.output}`);
			} else {
				console.log("\n=== Comparison Summary ===\n");
				for (const result of results) {
					console.log(`Strategy: ${result.strategy}`);
					console.log(`  P@5: ${(result.summary.averages.precisionAtK[5] * 100).toFixed(1)}%`);
					console.log(`  R@5: ${(result.summary.averages.recallAtK[5] * 100).toFixed(1)}%`);
					console.log(`  MRR: ${result.summary.averages.mrr.toFixed(3)}`);
					console.log();
				}
			}
		} catch (error) {
			console.error("Error comparing strategies:", error);
			process.exit(1);
		}
	});

program.parse();
