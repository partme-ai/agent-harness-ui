// Adapted from ZCode 29628c9: settings/SkillsSection.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
import { useZCodeIntl, PluginStoreAvatar, WandSparkles, Switch, Button, Trash2 } from '../zcode_bridge.jsx';
export function SkillRow({ skill, pluginIconItem, setSelectedSkill, setEnabled, handleDeleteSkill }) {
    const { intl } = useZCodeIntl();
    return (<div key={skill.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-hover">
        {skill.scope === "plugin" && pluginIconItem ? (<PluginStoreAvatar item={pluginIconItem} className="size-9 bg-background"/>) : (<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-foreground-subtle" aria-hidden="true">
            <WandSparkles className="size-4"/>
          </div>)}
        <div role="button" tabIndex={0} className="min-w-0 cursor-default rounded-md outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-card" onClick={() => setSelectedSkill(skill)} onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedSkill(skill);
            }
        }}>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate text-ui-base font-medium text-foreground">{skill.name}</span>
          </div>
          <div className="mt-0.5 truncate text-ui-sm text-foreground-subtle">
            {skill.description ||
            intl.formatMessage({
                id: "settings.skills.noDescription",
            })}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {skill.scope === "plugin" ? null : (<>
              <Switch checked={skill.enabled} onCheckedChange={(checked) => {
                void setEnabled(skill.id, checked);
            }}/>
              <Button type="button" variant="ghost" size="icon-sm" className="shrink-0 text-foreground-subtle hover:bg-destructive/10 hover:text-destructive" aria-label={intl.formatMessage({ id: "common.delete" })} title={intl.formatMessage({ id: "common.delete" })} onClick={() => void handleDeleteSkill(skill)}>
                <Trash2 className="size-3.5" aria-hidden="true"/>
              </Button>
            </>)}
        </div>
      </div>);
}
