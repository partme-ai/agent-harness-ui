// Adapted from ZCode 29628c9: settings/UsageStatsSection.tsx. Apache-2.0.
import { AppUsagePanel } from "./AppUsagePanel.jsx";
import { CodingPlanUsagePanel, } from "./CodingPlanUsagePanel.jsx";
export function UsageStatsSection({ activeTab, providerSourcesLoading, workspaceIdentity, workspacePath, selectedCodingPlanSource, }) {
    if (activeTab === "app") {
        return <AppUsagePanel />;
    }
    return (<CodingPlanUsagePanel loadingSources={providerSourcesLoading} workspaceIdentity={workspaceIdentity} workspacePath={workspacePath} selectedSource={selectedCodingPlanSource}/>);
}
