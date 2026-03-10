# Installation Instructions

## Prerequisites

The benchmark harness requires OpenClaw's dependencies to be installed.

## Installation Steps

### 1. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### 2. Install OpenClaw dependencies

From the openclaw root directory:

```bash
cd /code/openclaw
pnpm install
```

**Note:** If `pnpm install` fails due to specific package issues (e.g., @tloncorp/api), you can try:

```bash
# Install without optional dependencies
pnpm install --no-optional

# Or skip problematic postinstall scripts
pnpm install --ignore-scripts
```

### 3. Verify installation

Check that commander is installed:

```bash
ls node_modules/commander
```

## Running the Benchmark

Once dependencies are installed:

```bash
# Run with pnpm
pnpm tsx src/memory/benchmark/cli.ts run

# Or directly with Node + tsx
node --loader tsx src/memory/benchmark/cli.ts run

# List available strategies
pnpm tsx src/memory/benchmark/cli.ts list-strategies
```

## Alternative: Bun Runtime

The benchmark can also run with Bun (faster startup):

```bash
bun src/memory/benchmark/cli.ts run
```

## Testing Without Full Install

The unit tests can run independently with Bun:

```bash
cd /code/openclaw
bun test src/memory/benchmark/benchmark.test.ts
```

This works because Bun has built-in module resolution and doesn't require node_modules for test execution.

## Troubleshooting

**Issue:** `Cannot find module 'commander'`
**Solution:** Ensure `pnpm install` completed successfully and node_modules/commander exists.

**Issue:** `pnpm install` fails on specific package
**Solution:** Try `pnpm install --no-optional` or check the package-specific error logs.

**Issue:** Import resolution errors
**Solution:** Ensure you're using Node 22+ with ESM support, or use tsx/bun for TypeScript execution.
