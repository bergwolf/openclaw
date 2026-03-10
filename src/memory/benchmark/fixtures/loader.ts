import { readFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import type { TestManifest, TestCase } from "../types.js";

/**
 * Load test manifest from JSON file
 */
export async function loadTestManifest(
	manifestPath: string,
): Promise<TestManifest> {
	const content = await readFile(manifestPath, "utf-8");
	const manifest = JSON.parse(content) as TestManifest;

	if (!manifest.version || !manifest.testCases) {
		throw new Error(
			`Invalid test manifest: missing version or testCases in ${manifestPath}`,
		);
	}

	return manifest;
}

/**
 * Copy corpus files to a workspace directory
 */
export async function setupCorpus(
	corpusSourceDir: string,
	workspaceDir: string,
	testCase: TestCase,
): Promise<void> {
	const memoryDir = path.join(workspaceDir, "memory");
	await mkdir(memoryDir, { recursive: true });

	for (const corpusFile of testCase.corpus) {
		const sourcePath = path.join(corpusSourceDir, corpusFile);
		const destPath = path.join(memoryDir, corpusFile);

		const destDir = path.dirname(destPath);
		await mkdir(destDir, { recursive: true });

		const content = await readFile(sourcePath, "utf-8");
		const { writeFile } = await import("node:fs/promises");
		await writeFile(destPath, content, "utf-8");
	}
}

/**
 * Get all available test manifests from a directory
 */
export async function discoverTestManifests(
	manifestsDir: string,
): Promise<string[]> {
	try {
		const entries = await readdir(manifestsDir);
		return entries
			.filter((entry) => entry.endsWith(".json"))
			.map((entry) => path.join(manifestsDir, entry));
	} catch (error) {
		return [];
	}
}

/**
 * Load corpus file content
 */
export async function loadCorpusFile(
	corpusDir: string,
	relativePath: string,
): Promise<string> {
	const fullPath = path.join(corpusDir, relativePath);
	return await readFile(fullPath, "utf-8");
}

/**
 * Validate test manifest schema
 */
export function validateTestManifest(manifest: TestManifest): string[] {
	const errors: string[] = [];

	if (!manifest.version) {
		errors.push("Missing version field");
	}

	if (!manifest.name) {
		errors.push("Missing name field");
	}

	if (!Array.isArray(manifest.testCases) || manifest.testCases.length === 0) {
		errors.push("testCases must be a non-empty array");
	}

	for (const [idx, testCase] of manifest.testCases.entries()) {
		if (!testCase.id) {
			errors.push(`Test case ${idx}: missing id`);
		}

		if (!testCase.query) {
			errors.push(`Test case ${testCase.id || idx}: missing query`);
		}

		if (!Array.isArray(testCase.corpus) || testCase.corpus.length === 0) {
			errors.push(`Test case ${testCase.id || idx}: corpus must be non-empty array`);
		}

		if (!Array.isArray(testCase.expectedResults)) {
			errors.push(
				`Test case ${testCase.id || idx}: expectedResults must be an array`,
			);
		}

		for (const [resIdx, expected] of testCase.expectedResults.entries()) {
			if (!expected.file) {
				errors.push(
					`Test case ${testCase.id || idx}, result ${resIdx}: missing file`,
				);
			}

			if (
				typeof expected.relevance !== "number" ||
				expected.relevance < 0 ||
				expected.relevance > 1
			) {
				errors.push(
					`Test case ${testCase.id || idx}, result ${resIdx}: relevance must be number between 0 and 1`,
				);
			}
		}
	}

	return errors;
}
