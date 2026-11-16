# Agent Harness UI

[简体中文](README.zh-CN.md) | English

Agent Harness UI is a three-size React workbench with a separate settings surface for agent configuration. It supports local interface review and workflow prototyping; **it is not yet connected to an agent runtime or production admin service**.

```text
Browser (desktop / tablet / mobile)
  → workbench, conversation, project / office / creative spaces
  → separate settings surface with the existing configuration console
  → local simulation and browser demo state
  ↛ model, knowledge, tool, device, or persistence services
```

On macOS, run `npm run desktop:macos` to build the native workspace with system-browser authorization. [Desktop authorization setup](docs/desktop-authorization.md)

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

Open <http://127.0.0.1:5189/index.html> for the automatic layout or <http://127.0.0.1:5189/compare.html> for the three-size comparison. Independent entries are `/desktop/index.html`, `/tablet/index.html`, and `/mobile/index.html`. The previous console is available at `/admin.html`; the workbench opens its pages within Settings. The preview binds to `127.0.0.1` and serves `dist/`; it does not proxy backend requests. Port `5189` is an example to keep this preview separate from other local projects. Without `--port`, the inherited script defaults to `5177`.

The automatic page chooses its layout from viewport width. The independent entries keep a specific device layout. `device=desktop|tablet|mobile` and `host=web|desktop|android|ipad` remain supported by the previous console at `/admin.html`; they do not make the browser a native host or connect physical hardware.

## Current capabilities

- Independent desktop, tablet, and mobile workbench entries plus a comparison page.
- Conversation, task list, local project boards, office and creative spaces, and a dedicated settings surface.
- Menus and interactive pages for model services and gateway rules, knowledge bases and shared spaces, agents, resources, and system administration.
- A local agent setup flow covering model selection, knowledge, agent configuration, trial, publishing, and device binding. Its checks and responses are simulated in the frontend.
- Existing configuration routes are in [`src/catalog.ts`](src/catalog.ts); the new settings mapping is in [`workspace/shared/settings/harness_sections.js`](workspace/shared/settings/harness_sections.js).

Workbench spaces and task groups use browser local storage. Existing configuration records remain in the previous console's in-memory state; its settings frame stays mounted while switching settings pages, but a page reload resets those records. This repository provides no real model call, document parsing, MCP, tool execution, device connection, or server persistence. UI flows should be treated as local demonstrations until their service integrations are implemented and verified.

## Source layout

| Path | Purpose |
|:---|:---|
| `workspace/` | Three-size workbench, settings shell, and local interaction state |
| `src/main.tsx`, `src/Shell.tsx` | Existing configuration console entry and shell |
| `src/pages/` | Feature screens and dialogs |
| `src/catalog.ts`, `src/shell_layout.ts` | Routes and navigation |
| `src/state.ts`, `src/context.tsx` | Demo data and session state |
| `src/compare.tsx` | Multi-size comparison entry |
| `scripts/build.mjs`, `scripts/build-workspace.mjs`, `scripts/serve.py` | Static build and local preview |
| `tests/` | Source and behavior checks |
| `docs/` | Design notes and workflow records |

The private application is at version `0.1.0` in [`package.json`](package.json). Locked frontend dependencies include React 19.2.0, Ant Design 6.6.5, TypeScript 5.9.3, and esbuild 0.28.2. No published npm package or release channel is documented here.

## Development and verification

```bash
npm run typecheck
npm test
npm run build
```

`npm run build` generates the workbench entries, `dist/compare.html`, and the existing console at `dist/admin.html`. `npm run preview` requires a successful build. The full test suite has a known fixture gap: [`tests/gugong-figma.test.ts`](tests/gugong-figma.test.ts) imports `evidence/gugong-figma/colors-audit.json`, which is absent from this checkout. A full `npm test` run cannot be reported as passing until the fixture is restored or the test is revised from verified source data.

No CI workflow is checked into this repository. Verify each later change with relevant tests, type checking, a build, and the target viewport before reporting it as accepted.

## License

The repository is licensed under [MIT](LICENSE). The imported workbench source retains its [upstream MIT notice](workspace/UPSTREAM-LICENSE), and its settings adaptation retains a separate third-party notice in `workspace/third_party/zcode/LICENSE`.
