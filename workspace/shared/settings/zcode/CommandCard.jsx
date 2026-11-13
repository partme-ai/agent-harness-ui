// Adapted from ZCode 29628c9: settings/CommandCard.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
import { Terminal } from '../zcode_bridge.jsx';
import { isPluginCommand, isUserCommand } from '../zcode_bridge.jsx';
import { useZCodeIntl } from '../zcode_bridge.jsx';
import { Switch } from '../zcode_bridge.jsx';
import { settingsResourceRowInteraction } from './settingsResourceRowInteraction.js';
import { PluginStoreAvatar } from '../zcode_bridge.jsx';
export function isEditableUserCommand(command) {
    return isUserCommand(command) && command.location.source === "zcode";
}
export function CommandCard({ command, onEdit, onToggle, isOperating, pluginIconItem, }) {
    const { intl } = useZCodeIntl();
    const canEdit = isEditableUserCommand(command);
    const editable = canEdit && Boolean(onEdit) && !isOperating;
    return (<div className={`grid cursor-default grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors ${editable ? "hover:bg-hover" : ""}`} {...settingsResourceRowInteraction(editable ? () => onEdit?.(command) : undefined)}>
      {isPluginCommand(command) && pluginIconItem ? (<PluginStoreAvatar item={pluginIconItem} className="size-9 bg-background" fallbackIcon={<Terminal className="size-4"/>}/>) : (<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-foreground-subtle" aria-hidden="true">
          <Terminal className="size-4"/>
        </div>)}

      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-ui-base font-medium text-foreground">{command.name}</span>
          {command.argumentHint ? (<span className="text-ui-base text-foreground-subtlest">{command.argumentHint}</span>) : null}
        </div>
        <p className="mt-0.5 line-clamp-2 text-ui-sm text-foreground-subtle">
          {command.description || intl.formatMessage({ id: "settings.commands.noDescription" })}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isUserCommand(command) && onToggle ? (<Switch checked={command.enabled} onCheckedChange={(enabled) => onToggle(command, enabled)} disabled={isOperating}/>) : null}
      </div>
    </div>);
}
