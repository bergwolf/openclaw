/**
 * Mock strategy for testing the benchmark framework end-to-end.
 * Returns synthetic results based on test case IDs without requiring
 * the full OpenClaw memory infrastructure.
 *
 * Implements the Strategy interface from base.ts
 */
export class MockStrategy {
  readonly name = "mock-for-testing";
  readonly description = "Mock strategy that returns synthetic results for E2E testing";
  readonly config = {
    maxResults: 10,
    minScore: 0.0,
  };

  async initialize(_workspaceDir: string): Promise<void> {
    // No initialization needed for mock strategy
  }

  async search(
    query: string,
    testCaseId?: string,
  ): Promise<
    Array<{ file: string; score: number; snippet: string; lineRange?: [number, number] }>
  > {
    // Return different results based on test case ID to match expected results

    if (!testCaseId) {
      return this.getDefaultResults(query);
    }

    // Match expected results from test-cases.json for accurate metrics
    switch (testCaseId) {
      case "factual-jwt-auth":
        return [
          {
            file: "decisions.md",
            score: 0.95,
            snippet: "We chose JWT for authentication because...",
            lineRange: [15, 20],
          },
        ];

      case "factual-api-port":
        return [
          {
            file: "decisions.md",
            score: 0.92,
            snippet: "API server runs on port 3000",
            lineRange: [80, 85],
          },
        ];

      case "conceptual-database":
        return [
          {
            file: "decisions.md",
            score: 0.88,
            snippet: "Database approach: PostgreSQL with connection pooling",
            lineRange: [25, 30],
          },
        ];

      case "conceptual-caching":
        return [
          {
            file: "decisions.md",
            score: 0.9,
            snippet: "Caching strategy using Redis for session storage",
            lineRange: [35, 40],
          },
        ];

      case "temporal-recent-optimization":
        return [
          {
            file: "recent-changes.md",
            score: 0.93,
            snippet: "Performance optimization: database query caching implemented",
            lineRange: [10, 15],
          },
        ];

      case "temporal-security-audit":
        return [
          {
            file: "recent-changes.md",
            score: 0.89,
            snippet: "Security audit completed, no critical issues found",
            lineRange: [25, 30],
          },
        ];

      case "multi-file-authentication":
        return [
          {
            file: "decisions.md",
            score: 0.91,
            snippet: "JWT authentication decision",
            lineRange: [15, 20],
          },
          {
            file: "recent-changes.md",
            score: 0.87,
            snippet: "Implemented JWT middleware",
            lineRange: [40, 45],
          },
        ];

      case "multi-file-infrastructure":
        return [
          {
            file: "decisions.md",
            score: 0.85,
            snippet: "Infrastructure uses Docker and Kubernetes",
            lineRange: [50, 55],
          },
          {
            file: "recent-changes.md",
            score: 0.82,
            snippet: "Migrated to Kubernetes cluster",
            lineRange: [60, 65],
          },
        ];

      case "negative-kubernetes":
        // Correctly return empty for negative test
        return [];

      case "technical-websocket":
        return [
          {
            file: "recent-changes.md",
            score: 0.88,
            snippet: "WebSocket implementation using Socket.io",
            lineRange: [70, 75],
          },
        ];

      case "technical-mobile-stack":
        return [
          {
            file: "recent-changes.md",
            score: 0.86,
            snippet: "Mobile stack: React Native for iOS and Android",
            lineRange: [90, 95],
          },
        ];

      case "metrics-performance":
        return [
          {
            file: "recent-changes.md",
            score: 0.94,
            snippet: "Performance metrics tracked with Prometheus",
            lineRange: [100, 105],
          },
        ];

      case "comparative-frontend":
        return [
          {
            file: "decisions.md",
            score: 0.89,
            snippet: "Frontend framework comparison: chose React over Vue",
            lineRange: [110, 115],
          },
        ];

      case "config-redis-details":
        return [
          {
            file: "decisions.md",
            score: 0.92,
            snippet: "Redis configuration: port 6379, max memory 2GB",
            lineRange: [120, 125],
          },
        ];

      case "architecture-microservices":
        return [
          {
            file: "recent-changes.md",
            score: 0.9,
            snippet: "Microservices architecture with API gateway pattern",
            lineRange: [130, 135],
          },
        ];

      default:
        return this.getDefaultResults(query);
    }
  }

  private getDefaultResults(
    query: string,
  ): Array<{ file: string; score: number; snippet: string; lineRange?: [number, number] }> {
    return [
      {
        file: "decisions.md",
        score: 0.75,
        snippet: `Result for query: ${query}`,
        lineRange: [1, 5],
      },
    ];
  }

  async close(): Promise<void> {
    // No cleanup needed
  }
}
