// Adapted from ZCode 29628c9: settings/SettingsResourceGroup.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
export function SettingsResourceGroupHeader({ actions, count, title, }) {
    const heading = (<h3 className="flex h-7 items-center gap-1.5 text-ui-base font-medium text-foreground">
      {title}
      <span className="text-ui-sm font-normal text-foreground-subtle">{count}</span>
    </h3>);
    return actions ? (<div className="flex flex-wrap items-center justify-between gap-3">
      {heading}
      {actions}
    </div>) : (heading);
}
export function SettingsResourceList({ getKey, items, renderItem, }) {
    if (items.length === 0)
        return null;
    return (<div className="overflow-hidden rounded-xl bg-surface">
      {items.map((item, index) => (<div key={getKey(item)}>
          {index > 0 ? <div className="h-px bg-border/50" aria-hidden="true"/> : null}
          {renderItem(item)}
        </div>))}
    </div>);
}
