// Adapted from ZCode 29628c9: settings/SettingsFormTextarea.tsx. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
import { cn } from '../zcode_bridge.jsx';
import { Textarea } from '../zcode_bridge.jsx';
export function SettingsFormTextarea({ className, ...props }) {
    return (<Textarea className={cn("rounded-lg border border-input-border bg-input px-2 py-2 text-ui-base shadow-none placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0", className)} {...props}/>);
}
