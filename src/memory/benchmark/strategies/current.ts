import type { Strategy, StrategyConfig } from "./base.js";
import type { SearchResult } from "../types.js";
import { createMemoryManagerOrThrow } from "../../test-manager.js";
import type { OpenClawConfig } from "../../../config/types.js";
import { buildMemoryConfig } from "../config-builder.js";

/**
 * Current production baseline strategy using hybrid search (0.7 vector, 0.3 text)
 */
export class CurrentStrategy implements Strategy {
	readonly name = "current-baseline";
	readonly description =
		"Production baseline: hybrid search with 70% vector, 30% BM25 text";
	readonly config: StrategyConfig;

	private manager: Awaited<ReturnType<typeof createMemoryManagerOrThrow>> | null = null;
	private workspaceDir: string | null = null;

	constructor(config: StrategyConfig = {}) {
		this.config = {
			maxResults: 6,
			minScore: 0.35,
			vectorWeight: 0.7,
			textWeight: 0.3,
			...config,
		};
	}

	async initialize(workspaceDir: string): Promise<void> {
		this.workspaceDir = workspaceDir;

		const memoryConfig = buildMemoryConfig({
			workspaceDir,
			vectorWeight: this.config.vectorWeight as number,
			textWeight: this.config.textWeight as number,
			maxResults: this.config.maxResults,
			minScore: this.config.minScore,
			mmrEnabled: this.config.mmrEnabled as boolean | undefined,
			temporalDecayEnabled: this.config.temporalDecayEnabled as
				| boolean
				| undefined,
		}) as OpenClawConfig;

		this.manager = await createMemoryManagerOrThrow(
			memoryConfig,
			"benchmark-agent",
		);

		await this.manager.sync();
	}

	async search(query: string): Promise<SearchResult[]> {
		if (!this.manager) {
			throw new Error("Strategy not initialized. Call initialize() first.");
		}

		const results = await this.manager.search(query);

		return results.map((result) => ({
			file: result.path,
			lineRange: [result.startLine, result.endLine] as [number, number],
			snippet: result.snippet,
			score: result.score,
		}));
	}

	async close(): Promise<void> {
		if (this.manager) {
			await this.manager.close();
			this.manager = null;
		}
	}
}
