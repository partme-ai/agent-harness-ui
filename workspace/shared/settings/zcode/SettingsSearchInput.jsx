// Adapted from ZCode 29628c9: settings/SettingsSearchInput.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
import { Search, X } from '../zcode_bridge.jsx';
import { cn } from '../zcode_bridge.jsx';
import { Button } from '../zcode_bridge.jsx';
import { Input } from '../zcode_bridge.jsx';
export function SettingsSearchInput({ className, clearLabel = "Clear search", clearTestId, containerClassName, onClear, ...props }) {
    const canClear = Boolean(onClear && props.value && !props.disabled);
    return (<div className={cn("relative", containerClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" aria-hidden="true"/>
      <Input {...props} type="search" size="lg" className={cn("h-9 rounded-xl pl-9 [&::-webkit-search-cancel-button]:appearance-none", canClear && "pr-9", className)}/>
      {canClear ? (<Button type="button" variant="ghost" size="icon-sm" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full text-foreground-subtle" aria-label={clearLabel} data-testid={clearTestId} onClick={onClear}>
          <X className="size-3.5" aria-hidden="true"/>
        </Button>) : null}
    </div>);
}
