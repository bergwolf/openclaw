import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

interface AnonymizationRules {
	/** Domains to replace (e.g., ["company.com", "internal.net"]) */
	domains?: string[];
	/** API key patterns to scrub */
	apiKeyPatterns?: RegExp[];
	/** Names to replace */
	names?: string[];
	/** Custom replacements */
	customReplacements?: Array<{ pattern: RegExp; replacement: string }>;
}

const DEFAULT_RULES: AnonymizationRules = {
	domains: [],
	apiKeyPatterns: [
		/sk-[a-zA-Z0-9]{32,}/g,
		/ghp_[a-zA-Z0-9]{36}/g,
		/gho_[a-zA-Z0-9]{36}/g,
		/github_pat_[a-zA-Z0-9_]{82}/g,
		/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
	],
	names: [],
	customReplacements: [],
};

/**
 * Anonymize a single memory file
 */
export async function anonymizeFile(
	inputPath: string,
	outputPath: string,
	rules: AnonymizationRules = {},
): Promise<void> {
	const content = await readFile(inputPath, "utf-8");
	const mergedRules = { ...DEFAULT_RULES, ...rules };

	let anonymized = content;

	for (const pattern of mergedRules.apiKeyPatterns || []) {
		anonymized = anonymized.replace(pattern, "[REDACTED_KEY]");
	}

	for (const domain of mergedRules.domains || []) {
		const domainRegex = new RegExp(domain.replace(/\./g, "\\."), "g");
		anonymized = anonymized.replace(domainRegex, "example.com");
	}

	for (const name of mergedRules.names || []) {
		const nameRegex = new RegExp(`\\b${name}\\b`, "gi");
		anonymized = anonymized.replace(nameRegex, "User");
	}

	for (const { pattern, replacement } of mergedRules.customReplacements || []) {
		anonymized = anonymized.replace(pattern, replacement);
	}

	await writeFile(outputPath, anonymized, "utf-8");
}

/**
 * Anonymize all memory files in a directory
 */
export async function anonymizeDirectory(
	inputDir: string,
	outputDir: string,
	rules: AnonymizationRules = {},
): Promise<number> {
	const entries = await readdir(inputDir);
	let processedCount = 0;

	for (const entry of entries) {
		const inputPath = path.join(inputDir, entry);
		const stats = await stat(inputPath);

		if (stats.isFile() && entry.endsWith(".md")) {
			const outputPath = path.join(outputDir, entry);
			await anonymizeFile(inputPath, outputPath, rules);
			processedCount++;
		}
	}

	return processedCount;
}
