// Adapted from ZCode 29628c9: settings/SettingsPageParts.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
import { cn, Card, CardContent } from '../zcode_bridge.jsx';
export function SettingsRow({ label, description, control, detail, controlLayout = "default", }) {
    return (<div className="border-t border-border px-4 py-3 first:border-t-0">
      <div className={cn("grid items-center gap-4", controlLayout === "wide"
            ? "grid-cols-1 sm:grid-cols-[minmax(0,1fr)_280px]"
            : "grid-cols-[minmax(0,1fr)_192px]")}>
        <div className="min-w-0">
          <div className="text-ui-base font-medium text-foreground">{label}</div>
          {description ? (<div className="mt-1 text-ui-base leading-6 text-foreground-subtle">{description}</div>) : null}
        </div>
        <div className="flex w-full flex-nowrap items-center justify-end gap-2">
          {controlLayout === "wide" ? detail : null}
          {control}
        </div>
      </div>
      {detail && controlLayout !== "wide" ? <div className="mt-3">{detail}</div> : null}
    </div>);
}
export function SettingsGroupCard({ children }) {
    return (<Card className="overflow-hidden rounded-xl border border-border bg-card py-0 shadow-none">
      <CardContent className="space-y-0 px-0">{children}</CardContent>
    </Card>);
}
