// Adapted from ZCode 29628c9: settings/usage-stats/usageStatsUiParts.tsx. Apache-2.0.
import { formatCompactTokenNumber } from "./tokenNumberFormat.jsx";
export const RANGE_OPTIONS = ["7d", "30d"];
export const USAGE_STATS_TABS_LIST_CLASS = "flex h-7 rounded-full bg-surface p-0.5 group-data-horizontal/tabs:h-7";
export const USAGE_STATS_TABS_TRIGGER_CLASS = "h-6 flex-none justify-center rounded-full border-transparent bg-transparent px-2.5 py-0 text-ui-sm font-medium text-foreground-subtle data-active:border-transparent data-active:bg-background data-active:text-foreground data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-background";
export function formatCompactNumber(locale, value) {
    if (!Number.isFinite(value)) {
        return "--";
    }
    return new Intl.NumberFormat(locale, {
        notation: value >= 1000 ? "compact" : "standard",
        maximumFractionDigits: value >= 1000 ? 1 : 0,
    }).format(value);
}
export function formatCompactTokenUsage(locale, value) {
    return formatCompactTokenNumber(locale, value);
}
export function formatSummaryCompactTokenUsage(locale, value) {
    const formatted = formatCompactTokenUsage(locale, value);
    // 通用紧凑格式会把中文单位直接贴在数字后；摘要卡片与相邻的时长、天数指标统一保留单位间距。
    return locale.startsWith("zh") ? formatted.replace(/(?<=\d)(?=[万亿])/u, " ") : formatted;
}
export function formatPercent(locale, value) {
    return new Intl.NumberFormat(locale, {
        style: "percent",
        maximumFractionDigits: value >= 0.1 ? 0 : 1,
    }).format(value);
}
export function formatDay(locale, dateKey) {
    if (!dateKey) {
        return "--";
    }
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
        // BigModel monitor 接口偶尔返回空字符串或非 yyyy-MM-dd 格式的日期,
        // 之前直接交给 Intl.DateTimeFormat 会抛 RangeError 把整个图表炸掉。
        return dateKey;
    }
    return new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
    }).format(date);
}
export function formatFullDay(locale, dateKey) {
    if (!dateKey) {
        return "--";
    }
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
        return dateKey;
    }
    return new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}
export function formatMonth(locale, dateKey) {
    const date = new Date(`${dateKey}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
        return dateKey.slice(5, 7);
    }
    return new Intl.DateTimeFormat(locale, {
        timeZone: "UTC",
        month: "short",
    }).format(date);
}
export function resolveModelLabel(intl, modelId) {
    return modelId?.trim() || intl.formatMessage({ id: "settings.usage.unknownModel" });
}
export function UsageEmptyState({ title, description }) {
    return (<div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
      <div className="text-ui-base font-medium text-foreground">{title}</div>
      <div className="mt-2 text-ui-base text-foreground-subtle">{description}</div>
    </div>);
}
