import type { OpenClawConfig } from "../../../config/types.js";

/**
 * Build a memory search configuration for testing
 */
export function buildMemoryConfig(options: {
	workspaceDir: string;
	indexPath?: string;
	provider?: string;
	model?: string;
	vectorWeight?: number;
	textWeight?: number;
	maxResults?: number;
	minScore?: number;
	mmrEnabled?: boolean;
	temporalDecayEnabled?: boolean;
}): Partial<OpenClawConfig> {
	const {
		workspaceDir,
		indexPath = `${workspaceDir}/memory.sqlite`,
		provider = "openai",
		model = "text-embedding-3-small",
		vectorWeight = 0.7,
		textWeight = 0.3,
		maxResults = 6,
		minScore = 0.35,
		mmrEnabled = false,
		temporalDecayEnabled = false,
	} = options;

	return {
		agents: {
			defaults: {
				workspace: workspaceDir,
			},
			memory: {
				backend: "builtin",
				search: {
					query: {
						maxResults,
						minScore,
						hybrid: {
							enabled: true,
							vectorWeight,
							textWeight,
							candidateMultiplier: 4,
							mmr: {
								enabled: mmrEnabled,
								lambda: 0.7,
							},
						},
					},
					temporalDecay: {
						enabled: temporalDecayEnabled,
						halfLifeDays: 30,
					},
				},
				builtin: {
					indexPath,
					embedding: {
						provider,
						model,
						batch: {
							enabled: false,
						},
					},
					chunking: {
						tokens: 400,
						overlap: 80,
					},
					cache: {
						enabled: true,
					},
				},
			},
		},
	};
}

/**
 * Preset configurations for common test scenarios
 */
export const PRESET_CONFIGS = {
	/** Current production baseline: 70% vector, 30% text */
	baseline: (workspaceDir: string) =>
		buildMemoryConfig({
			workspaceDir,
			vectorWeight: 0.7,
			textWeight: 0.3,
		}),

	/** Pure vector search */
	vectorOnly: (workspaceDir: string) =>
		buildMemoryConfig({
			workspaceDir,
			vectorWeight: 1.0,
			textWeight: 0.0,
		}),

	/** Pure keyword (BM25) search */
	keywordOnly: (workspaceDir: string) =>
		buildMemoryConfig({
			workspaceDir,
			vectorWeight: 0.0,
			textWeight: 1.0,
		}),

	/** Balanced hybrid */
	balanced: (workspaceDir: string) =>
		buildMemoryConfig({
			workspaceDir,
			vectorWeight: 0.5,
			textWeight: 0.5,
		}),

	/** With MMR diversity */
	withMMR: (workspaceDir: string) =>
		buildMemoryConfig({
			workspaceDir,
			mmrEnabled: true,
		}),

	/** With temporal decay */
	withDecay: (workspaceDir: string) =>
		buildMemoryConfig({
			workspaceDir,
			temporalDecayEnabled: true,
		}),
};
