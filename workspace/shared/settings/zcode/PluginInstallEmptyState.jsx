// Adapted from ZCode 29628c9: settings/PluginInstallEmptyState.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
const CONTAINER_CLASS_NAME = "rounded-xl border border-dashed border-border bg-transparent px-4 py-10 text-center";
export function PluginLoadingState({ label }) {
    return (<div className={`${CONTAINER_CLASS_NAME} text-ui-base text-foreground-subtle`}>{label}</div>);
}
export function PluginSearchEmptyState({ label }) {
    return (<div className={`${CONTAINER_CLASS_NAME} text-ui-base text-foreground-subtle`}>{label}</div>);
}
export function PluginInstallEmptyState({ actions, description, title, }) {
    return (<div className={`flex flex-col items-center justify-center gap-3 ${CONTAINER_CLASS_NAME}`}>
      <div className="space-y-1">
        <div className="text-ui-base font-medium text-foreground">{title}</div>
        <div className="text-ui-sm text-foreground-subtle">{description}</div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">{actions}</div>
    </div>);
}
