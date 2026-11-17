// Immutable built-in view manifests. Business packs and Settings are separate dimensions.
// External MCP Apps must go through an isolated host, never arbitrary module imports.
export const BUILTIN_WORKBENCH_VIEWS = Object.freeze([
  Object.freeze({
    id: 'office-map',
    label: '数字办公室',
    icon: 'office-map',
    version: 1,
    layouts: Object.freeze(['desktop','tablet','mobile']),
    requiredCapabilities: Object.freeze(['workbench.office.read']),
    supportedActors: Object.freeze(['human','agent','service']),
    provider: 'agent-fabric-projection',
    readOnly: true,
  }),
]);

export function findBuiltinWorkbenchView(id) {
  return BUILTIN_WORKBENCH_VIEWS.find(view => view.id === id) || null;
}
