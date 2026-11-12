# Agent Harness UI

[简体中文](README.zh-CN.md) | English

Agent Harness UI is a three-size React console for exploring agent configuration and delivery workflows. It supports local interface review and workflow prototyping; **it is not yet connected to an agent runtime or production admin service**.

```text
Browser (desktop / tablet / mobile)
  → React + Ant Design console
  → in-memory demo state and browser appearance settings
  → local simulation and UI feedback
  ↛ model, knowledge, tool, device, or persistence services
```

## Quick start

Requirements: Node.js 24 for the current TypeScript test runner, npm, and Python 3 for the static preview. Versions observed while writing this documentation: Node.js 24.18.0, npm 12.2.0, Python 3.14.8. These are observed versions, not a tested compatibility range.

```bash
git clone https://github.com/partme-ai/agent-harness-ui.git
cd agent-harness-ui
npm ci
npm run typecheck
npm run build
npm run preview -- --port 5189
```

Open <http://127.0.0.1:5189/index.html> for the console or <http://127.0.0.1:5189/compare.html> for the three-size comparison. The preview binds to `127.0.0.1` and serves `dist/`; it does not proxy backend requests. Port `5189` is an example to keep this preview separate from other local projects. Without `--port`, the inherited script defaults to `5177`.

The page accepts `device=desktop|tablet|mobile` for layout and `host=web|desktop|android|ipad` for host simulation. For example, <http://127.0.0.1:5189/index.html?device=mobile&host=web#/w/demo/home> opens the mobile Web layout. These parameters do not make the browser a native host or connect physical hardware.

## Current capabilities

- A shared desktop, tablet, and mobile console with theme and branding controls.
- Menus and interactive pages for model services and gateway rules, knowledge bases and shared spaces, agents, resources, and system administration.
- A local agent setup flow covering model selection, knowledge, agent configuration, trial, publishing, and device binding. Its checks and responses are simulated in the frontend.
- A comparison page for reviewing layouts. Source routes are in [`src/catalog.ts`](src/catalog.ts); menu structure is in [`src/shell_layout.ts`](src/shell_layout.ts).

Most business records are initialized in React state and return to demo data after a reload. Appearance and onboarding use separate browser storage keys. This repository provides no real model call, document parsing, MCP, tool execution, device connection, or server persistence. UI flows should be treated as local demonstrations until their service integrations are implemented and verified.

## Source layout

| Path | Purpose |
|:---|:---|
| `src/main.tsx`, `src/Shell.tsx` | Console entry and shared shell |
| `src/pages/` | Feature screens and dialogs |
| `src/catalog.ts`, `src/shell_layout.ts` | Routes and navigation |
| `src/state.ts`, `src/context.tsx` | Demo data and session state |
| `src/compare.tsx` | Multi-size comparison entry |
| `scripts/build.mjs`, `scripts/serve.py` | Static build and local preview |
| `tests/` | Source and behavior checks |
| `docs/` | Design notes and workflow records |

The private application is at version `0.1.0` in [`package.json`](package.json). Locked frontend dependencies include React 19.2.0, Ant Design 6.6.5, TypeScript 5.9.3, and esbuild 0.28.2. No published npm package or release channel is documented here.

## Development and verification

```bash
npm run typecheck
npm test
npm run build
```

`npm run build` generates `dist/index.html` and `dist/compare.html`. `npm run preview` requires a successful build. The full test suite has a known fixture gap: [`tests/gugong-figma.test.ts`](tests/gugong-figma.test.ts) imports `evidence/gugong-figma/colors-audit.json`, which is absent from this checkout. A full `npm test` run cannot be reported as passing until the fixture is restored or the test is revised from verified source data.

This README update documents existing code; it does not establish runtime connectivity, native-device acceptance, or CI status. No CI workflow is checked into this repository. Verify each later change with relevant tests, type checking, a build, and the target viewport before reporting it as accepted.

## License

The repository is licensed under [MIT](LICENSE). Third-party notices copied into the build are assembled by [`scripts/build.mjs`](scripts/build.mjs).
