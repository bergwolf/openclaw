import type { Strategy, StrategyConfig, StrategyFactory } from "./base.js";
import { CurrentStrategy } from "./current.js";

/**
 * Registry of available retrieval strategies
 */
export class StrategyRegistry {
  private factories = new Map<string, StrategyFactory>();

  constructor() {
    this.registerDefaultStrategies();
  }

  /**
   * Register default built-in strategies
   */
  private registerDefaultStrategies(): void {
    this.register("current-baseline", async (config) => new CurrentStrategy(config));
    this.register("baseline", async (config) => new CurrentStrategy(config));

    // Mock strategy for testing
    this.register("mock-for-testing", async () => {
      const { MockStrategy } = await import("./mock.js");
      return new MockStrategy();
    });

    this.register(
      "vector-only",
      async (config) =>
        new CurrentStrategy({
          ...config,
          vectorWeight: 1.0,
          textWeight: 0.0,
        }),
    );

    this.register(
      "keyword-only",
      async (config) =>
        new CurrentStrategy({
          ...config,
          vectorWeight: 0.0,
          textWeight: 1.0,
        }),
    );

    this.register(
      "balanced",
      async (config) =>
        new CurrentStrategy({
          ...config,
          vectorWeight: 0.5,
          textWeight: 0.5,
        }),
    );

    this.register(
      "with-mmr",
      async (config) =>
        new CurrentStrategy({
          ...config,
          mmrEnabled: true,
        }),
    );

    this.register(
      "with-decay",
      async (config) =>
        new CurrentStrategy({
          ...config,
          temporalDecayEnabled: true,
        }),
    );
  }

  /**
   * Register a new strategy factory
   */
  register(name: string, factory: StrategyFactory): void {
    this.factories.set(name, factory);
  }

  /**
   * Create a strategy instance by name
   */
  async create(name: string, config: StrategyConfig = {}): Promise<Strategy> {
    const factory = this.factories.get(name);
    if (!factory) {
      throw new Error(
        `Unknown strategy: ${name}. Available: ${Array.from(this.factories.keys()).join(", ")}`,
      );
    }

    return await factory(config);
  }

  /**
   * Get list of available strategy names
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.factories.keys());
  }

  /**
   * Check if a strategy exists
   */
  has(name: string): boolean {
    return this.factories.has(name);
  }
}

/**
 * Global registry instance
 */
export const strategyRegistry = new StrategyRegistry();
