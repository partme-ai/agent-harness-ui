# ZCode reference and attribution

Copyright 2026 Z.AI Co., Ltd. Licensed under Apache-2.0; see [LICENSE](LICENSE).

Source: https://github.com/zai-org/ZCode, reference commit `29628c9acdb81b703bbd4080c207a0e7ce5e276e`.

The files in `src/app/settings/zcode/` now contain imported ZCode components, rendering functions, configuration conversion logic and Chinese messages. TypeScript types are stripped and imports are redirected to Buddy's host adapter. `SubagentViews`, `SkillRow`, `PluginRows` and `SettingsPageParts` retain selected upstream functions or their original return JSX; their host state and service orchestration are supplied separately. See `manifest.json` in that directory for source paths and source/output SHA-256 hashes. `scripts/sync_zcode_settings.mjs` reproduces the import from the pinned checkout; `scripts/check_zcode_settings.mjs` verifies provenance.

`SourceSettings.jsx`, `resource_catalog.js` and `zcode_bridge.jsx` are Buddy integration code, not unmodified ZCode source. `zcode_settings.css` maps upstream utility classes and dimensions into scoped CSS because Buddy does not use ZCode's Tailwind pipeline. The existing icon library and native select controls substitute for ZCode's Lucide/Radix dependencies. The Finder icon in `provider_icons/finder.png` is copied from `packages/ui/src/onboarding/assets/finder.png`.

Agent Buddy adapts the setting field labels, sidebar/account menu organization, settings page structure and provider icons from `packages/ui/src`. Affected Buddy files are `src/app/settings/SettingsCenter.jsx`, `settings_config.js`, `settings.css`, `SidebarAccountMenu.jsx`, `provider_icons/*` and the shared sidebar footer in `src/app/App.jsx`.

Modifications: integrate with Buddy navigation and theme tokens, keep Buddy sidebar width and workspace state, replace ZCode service dependencies with explicitly marked persistent local mock services. This adaptation does not include ZCode account authentication, subscription entitlements, provider credentials or native platform services. Provider marks identify their respective services and do not indicate endorsement.

Mobile connection and bot management: `src/app/mobile/zcode/` imports the complete orchestration and JSX from `BotsDialog.tsx`, the complete `BotSummaryCard.tsx`, `ProviderSettingsCard.tsx`, `WorkspaceAccessCard.tsx`, `shared.tsx`, `botsUi.ts`, and Chinese bot messages. `scripts/sync_zcode_mobile.mjs` reproduces the import and records source/output hashes. Channel PNGs are copied from `packages/ui/src/assets/channel-icons/`. `BotsDialog.jsx` and `bots_bridge.jsx` are Buddy preview adapters, not ZCode service implementations. The mobile scan column follows the user-supplied earlier two-column screenshot; current pinned ZCode `WebRemoteControlDialog.tsx` only retains Bot Channels. The local mock adapter implements QR confirmation, registration polling, credential references, expiring binding codes, unbinding and persistence. It does not implement real account authentication, WebSocket, cross-device remote control or message delivery. See docs/functional-design/SETTINGS-MOCK-INTERACTIONS.md for the verified boundary.

Live registration: `scripts/zcode_registration/` imports the upstream Weixin and Feishu/Lark registration services, with TypeScript stripped and the Weixin base URL import replaced by its pinned constant. Source/output hashes are recorded in its manifest. The Buddy Vite adapter forwards registration to the original official APIs and stores credentials on the local server. No platform CLI is called by these upstream registration implementations.

## Surfium integration (2026-09-30)

The adapted files now live in `web/buddy/settings/` and `web/buddy/mobile/`. The original Buddy manifests retain upstream symbol/source provenance. `web/buddy/source_manifest.json` records the Buddy working-tree snapshot and the integrated output hashes. Local modifications replace control rendering with Ant Design React 6, add responsive layout and same-origin comparison messaging, isolate mock storage keys, and generate QR codes locally. These files are adaptations; they are not unmodified upstream files. See also THIRD-PARTY-NOTICES.md.

`web/buddy/Conversation.jsx` is a new renderer inspired by ZCode's ordered conversation projection and Streamdown rendering. It does not copy the complete ZCode conversation runtime, service implementation, account capabilities, or platform bridge.

Composer interaction adaptation: `web/buddy/pickerFocus.ts` is copied verbatim from `packages/ui/src/lib/pickerFocus.ts` under the upstream MIT license. `Composer.jsx` uses Ant Design controls to adapt the exclusive picker, independent Plan flag and three permission choices from V4ComposerModeControls; it is not a copy of the complete Lexical editor or execution runtime. Source hashes and reuse categories are recorded in `web/buddy/zcode_composer_manifest.json`.

## TinyClaw direct source import (2026-10-01)

`shared/zcode/ui/` and `shared/zcode/shared/` now include files copied directly from the pinned ZCode checkout. `zcode_sources.json` records 48 verbatim copies and two explicit excerpts, with source and output SHA-256 hashes. Original source code remains under the upstream MIT license. `shared/zcode/adapters/`, the selective shared barrel, product wrappers and responsive/color overrides are TinyClaw integrations. The imported Radix/Tailwind controls retain their original implementations. Existing Buddy-derived settings and channel files now reside in `shared/settings/` and `shared/channels/`; their historical provenance statements above still describe adaptations, not verbatim source. See `ZCODE_MIGRATION.md` for implemented and outstanding runtime boundaries.
