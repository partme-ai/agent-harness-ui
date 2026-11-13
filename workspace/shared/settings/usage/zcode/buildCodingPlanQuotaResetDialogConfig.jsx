// Adapted from ZCode 29628c9: components/coding-plan-quota-reset/buildCodingPlanQuotaResetDialogConfig.ts. Apache-2.0.
function createResetItem(params) {
    const { enabled, entry, opportunityVisible, processing, quotaFull } = params;
    if (!enabled ||
        !entry ||
        (!processing && entry.status !== "completed" && (!opportunityVisible || quotaFull))) {
        return null;
    }
    return {
        count: entry.opportunityCount,
        expiresAt: entry.opportunityExpiresAt,
        onReset: params.onReset,
        processing,
        resetType: params.resetType,
    };
}
export function buildCodingPlanQuotaResetDialogConfig(params) {
    const { resetUi } = params;
    const resetItems = [
        createResetItem({
            enabled: params.fiveHourEnabled,
            entry: resetUi.entry,
            onReset: resetUi.reset,
            opportunityVisible: resetUi.opportunityVisible,
            processing: resetUi.processing,
            quotaFull: params.fiveHourQuotaFull,
            resetType: "FIVE_HOUR",
        }),
        createResetItem({
            enabled: params.weekEnabled,
            entry: resetUi.week.entry,
            onReset: resetUi.week.reset,
            opportunityVisible: resetUi.week.opportunityVisible,
            processing: resetUi.week.processing,
            quotaFull: params.weekQuotaFull,
            resetType: "WEEK",
        }),
    ].filter((item) => item !== null);
    return { resetItems, usageItems: params.usageItems };
}
