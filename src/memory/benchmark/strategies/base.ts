import type { SearchResult } from "../types.js";

/**
 * Configuration options for a search strategy
 */
export interface StrategyConfig {
  /** Maximum number of results to return */
  maxResults?: number;
  /** Minimum relevance score threshold */
  minScore?: number;
  /** Strategy-specific parameters */
  [key: string]: unknown;
}

/**
 * Base interface for memory retrieval strategies
 */
export interface Strategy {
  /** Unique name for this strategy */
  readonly name: string;

  /** Human-readable description */
  readonly description: string;

  /** Current configuration parameters */
  readonly config: StrategyConfig;

  /**
   * Execute a search query and return ranked results
   * @param query - The search query string
   * @param testCaseId - Optional test case ID for test-specific behavior
   * @returns Promise of ranked search results
   */
  search(query: string, testCaseId?: string): Promise<SearchResult[]>;

  /**
   * Initialize the strategy with a workspace
   * @param workspaceDir - Path to workspace containing memory files
   */
  initialize(workspaceDir: string): Promise<void>;

  /**
   * Clean up resources
   */
  close(): Promise<void>;
}

/**
 * Factory function type for creating strategy instances
 */
export type StrategyFactory = (config: StrategyConfig) => Promise<Strategy>;
