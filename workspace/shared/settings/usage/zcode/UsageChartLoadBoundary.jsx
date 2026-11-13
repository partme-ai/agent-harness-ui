// Adapted from ZCode 29628c9: settings/usage-stats/UsageChartLoadBoundary.tsx. Apache-2.0.
import { Suspense } from "react";
import { ScopedErrorBoundary } from "../usage_bridge.jsx";
import { useZCodeIntl } from "../usage_bridge.jsx";
import { UsageEmptyState } from "./usageStatsUiParts.jsx";
export function UsageChartLoadBoundary({ children, loadingDescription, resetKeys, scope, }) {
    const { intl } = useZCodeIntl();
    return (<ScopedErrorBoundary scope={scope} resetKeys={resetKeys} variant="inline">
      <Suspense fallback={<UsageEmptyState title={intl.formatMessage({ id: "settings.usage.loadingTitle" })} description={loadingDescription}/>}>
        {children}
      </Suspense>
    </ScopedErrorBoundary>);
}
