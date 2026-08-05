# Graph Report - .  (2026-08-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 83 nodes · 73 edges · 27 communities (13 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bd68a5ed`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dependencies
- scripts
- tsconfig.json
- compilerOptions
- package.json
- devDependencies
- renovate.json
- @axe-core/playwright
- check-file.sh
- eslint
- @eslint/js
- eslint-plugin-astro
- @playwright/test
- prettier
- prettier-plugin-astro
- @types/node
- typescript
- typescript-eslint
- vitest
- @vitest/coverage-v8
- zod

## God Nodes (most connected - your core abstractions)
1. `scripts` - 8 edges
2. `compilerOptions` - 7 edges
3. `include` - 3 edges
4. `engines` - 2 edges
5. `@astrojs/preact` - 2 edges
6. `@tailwindcss/vite` - 2 edges
7. `astro` - 2 edges
8. `preact` - 2 edges
9. `tailwindcss` - 2 edges
10. `@astrojs/check` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (27 total, 14 thin omitted)

### Community 0 - "dependencies"
Cohesion: 0.18
Nodes (11): astro, @astrojs/preact, dependencies, astro, @astrojs/preact, preact, tailwindcss, @tailwindcss/vite (+3 more)

### Community 1 - "scripts"
Cohesion: 0.25
Nodes (8): scripts, astro, build, check, dev, preview, test, test:e2e

### Community 2 - "tsconfig.json"
Cohesion: 0.25
Nodes (7): **/*, astro/tsconfigs/strictest, .astro/types.d.ts, dist, exclude, extends, include

### Community 3 - "compilerOptions"
Cohesion: 0.29
Nodes (7): compilerOptions, exactOptionalPropertyTypes, jsx, jsxImportSource, noImplicitOverride, noUncheckedIndexedAccess, verbatimModuleSyntax

### Community 4 - "package.json"
Cohesion: 0.33
Nodes (5): engines, node, name, type, version

### Community 5 - "devDependencies"
Cohesion: 0.40
Nodes (5): @astrojs/check, devDependencies, @astrojs/check, prettier-plugin-tailwindcss, prettier-plugin-tailwindcss

### Community 6 - "renovate.json"
Cohesion: 0.50
Nodes (3): config:recommended, extends, $schema

## Knowledge Gaps
- **45 isolated node(s):** `check-file.sh script`, `name`, `type`, `version`, `node` (+40 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`, `@axe-core/playwright`, `eslint`, `@eslint/js`, `eslint-plugin-astro`, `@playwright/test`, `prettier`, `prettier-plugin-astro`, `@types/node`, `typescript`, `typescript-eslint`, `vitest`, `@vitest/coverage-v8`, `zod`?**
  _High betweenness centrality (0.352) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **What connects `check-file.sh script`, `name`, `type` to the rest of the system?**
  _45 weakly-connected nodes found - possible documentation gaps or missing edges._