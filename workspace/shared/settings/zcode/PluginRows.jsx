import {AntNativeButton} from '../../ant_controls.jsx';
// Adapted from ZCode 29628c9: settings/PluginsSection.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
import { Fragment } from 'react';
import { useZCodeIntl, PluginStoreAvatar, PluginStoreUpdateBadge, PluginStoreUpdateButton, resolveManagedPluginDisplay, Button, Switch, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, MoreHorizontal, RefreshCw, RotateCcw, Trash2, Loader2 } from '../zcode_bridge.jsx';
import { SettingsScopeBadge } from './SettingsScopeBadge.jsx';
export function PluginRows({ items, actions, storeItemById, configScope = 'user', operatingPluginIds = new Set(), pluginUpdateActions }) {
    const { intl, locale } = useZCodeIntl();
    const operationId = null, togglingPluginId = null;
    const canUpdatePluginItem = item => Boolean(item?.updateAvailable);
    const handleUpdatePlugin = id => actions.onUpdate?.(id);
    const handleResetPluginConfig = id => actions.onReset?.(id);
    const uninstall = { requestUninstall: id => actions.onUninstall?.(id) };
    const renderPluginRows = (items) => (<div className="overflow-hidden rounded-xl bg-surface">
      {items.map((plugin, index) => (<Fragment key={plugin.id}>
          {index > 0 ? <div className="h-px bg-border/50" aria-hidden="true"/> : null}
          <div className="group/plugin-row flex min-w-0 items-center gap-3 px-4 py-3 transition-colors hover:bg-hover" data-testid="plugin-settings-plugin-row" data-plugin-id={plugin.id}>
            <AntNativeButton type="button" className="tc-plugin-open flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused" onClick={() => actions.onOpenDetail(plugin.id)}>
              <PluginStoreAvatar item={storeItemById.get(plugin.id) ?? { name: plugin.name }} className="size-9 bg-background"/>
              <div className="tc-plugin-copy min-w-0 flex-1">
                <div className="tc-plugin-title flex min-w-0 items-center gap-1.5">
                  <span className="min-w-0 truncate text-ui-base font-medium text-foreground">
                    {resolveManagedPluginDisplay(plugin, storeItemById.get(plugin.id), locale).name}
                  </span>
                  <PluginStoreUpdateBadge item={storeItemById.get(plugin.id)}/>
                </div>
                {resolveManagedPluginDisplay(plugin, storeItemById.get(plugin.id), locale)
                .description ? (<div className="tc-plugin-description mt-0.5 line-clamp-1 text-ui-sm text-foreground-subtle">
                    {resolveManagedPluginDisplay(plugin, storeItemById.get(plugin.id), locale)
                    .description}
                  </div>) : null}
                <div className="tc-plugin-scope mt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <SettingsScopeBadge scope={plugin.enabledSource ?? "default"} label={configScope === "user" && plugin.enabledSource === "user"
                ? intl.formatMessage({
                    id: "settings.plugins.scope.userDefault",
                })
                : plugin.enabledSource === "user"
                    ? intl.formatMessage({
                        id: "settings.plugins.scope.inheritedUser",
                    })
                    : plugin.enabledSource === "workspace"
                        ? intl.formatMessage({
                            id: "settings.plugins.scope.workspaceOverride",
                        })
                        : undefined}/>
                  </div>
                </div>
              </div>
            </AntNativeButton>
            <PluginStoreUpdateButton item={storeItemById.get(plugin.id)} actions={actions}/>
            {plugin.packageStatus === "missing" ? null : (<DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={intl.formatMessage({ id: "common.more" })} className="text-foreground-subtle opacity-0 group-hover/plugin-row:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100">
                    <MoreHorizontal className="size-4" aria-hidden="true"/>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canUpdatePluginItem(storeItemById.get(plugin.id)) ? (<DropdownMenuItem disabled={operationId !== null} onSelect={() => void handleUpdatePlugin(plugin.id)}>
                      <RefreshCw className="size-4" aria-hidden="true"/>
                      {intl.formatMessage({
                        id: "settings.plugins.detail.update",
                    })}
                    </DropdownMenuItem>) : null}
                  {configScope === "workspace" && plugin.enabledSource === "workspace" ? (<DropdownMenuItem disabled={operationId !== null || togglingPluginId === plugin.id} onSelect={() => void handleResetPluginConfig(plugin.id)}>
                      <RotateCcw className="size-4" aria-hidden="true"/>
                      {intl.formatMessage({
                        id: "settings.plugins.scope.restoreUserDefault",
                    })}
                    </DropdownMenuItem>) : null}
                  <DropdownMenuItem variant="destructive" disabled={operationId !== null} onSelect={() => uninstall.requestUninstall(plugin.id)}>
                    <Trash2 className="size-4" aria-hidden="true"/>
                    {intl.formatMessage({
                    id: "settings.plugins.detail.uninstall",
                })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>)}
            <div className="flex shrink-0 items-center gap-2">
              {togglingPluginId === plugin.id ? (<Loader2 className="size-4 animate-spin text-foreground-subtle" data-testid="plugin-settings-enabled-pending" aria-label={intl.formatMessage({ id: "settings.plugins.toggle.pending" }, {
                    plugin: resolveManagedPluginDisplay(plugin, storeItemById.get(plugin.id), locale).name,
                })}/>) : null}
              <Switch data-testid="plugin-settings-enabled-switch" data-plugin-id={plugin.id} checked={plugin.enabled} disabled={togglingPluginId === plugin.id} aria-busy={togglingPluginId === plugin.id} aria-label={intl.formatMessage({
                id: plugin.enabled
                    ? "settings.plugins.toggle.disable"
                    : "settings.plugins.toggle.enable",
            }, {
                plugin: resolveManagedPluginDisplay(plugin, storeItemById.get(plugin.id), locale).name,
            })} onCheckedChange={(enabled) => {
                actions.onSetEnabled?.(plugin.id, enabled);
            }}/>
            </div>
          </div>
        </Fragment>))}
    </div>);
    return renderPluginRows(items);
}
