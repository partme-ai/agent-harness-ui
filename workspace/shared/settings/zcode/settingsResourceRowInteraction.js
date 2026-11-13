// Adapted from ZCode 29628c9: settings/settingsResourceRowInteraction.ts. Apache-2.0.
// UI markup retained; host dependencies supplied by Buddy's preview adapter.
const INTERACTIVE_SELECTOR = "button,a,input,select,textarea,[role=switch],[role=menuitem]";
export function settingsResourceRowInteraction(onActivate) {
    if (!onActivate)
        return {};
    return {
        role: "button",
        tabIndex: 0,
        onClick: (event) => {
            if (event.target.closest(INTERACTIVE_SELECTOR))
                return;
            onActivate();
        },
        onKeyDown: (event) => {
            if (event.target !== event.currentTarget)
                return;
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onActivate();
            }
        },
    };
}
