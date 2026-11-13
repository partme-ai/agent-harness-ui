// Adapted from ZCode 29628c9: settings/SettingsFormActions.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
export function SettingsFormActions({ leadingAction, children, }) {
    return (<div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center">
      {leadingAction}
      <div className="flex items-center justify-end gap-2 sm:ml-auto">{children}</div>
    </div>);
}
