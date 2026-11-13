// Adapted from ZCode 29628c9: settings/SettingsScopeBadge.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
import { CircleDashed, Folder, UserRound } from '../zcode_bridge.jsx';
import { Badge } from '../zcode_bridge.jsx';
import { useZCodeIntl } from '../zcode_bridge.jsx';
export function SettingsScopeBadge({ scope, label, includeMcpTestAttribute = false, }) {
    const { intl } = useZCodeIntl();
    return (<Badge variant="secondary" className="rounded-full border-border bg-surface text-ui-sm" data-settings-scope={scope} data-mcp-scope={includeMcpTestAttribute ? scope : undefined}>
      <span data-icon="inline-start" className="size-3.5" aria-hidden="true">
        {scope === "workspace" ? (<Folder className="size-full"/>) : scope === "user" ? (<UserRound className="size-full"/>) : (<CircleDashed className="size-full"/>)}
      </span>
      {label ?? intl.formatMessage({ id: `settings.scope.${scope}` })}
    </Badge>);
}
