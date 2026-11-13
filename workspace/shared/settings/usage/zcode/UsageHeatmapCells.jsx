// Adapted from ZCode 29628c9: settings/usage-stats/UsageHeatmapCells.tsx. Apache-2.0.
import { ControlHintTooltip } from "../usage_bridge.jsx";
import { cn } from "../usage_bridge.jsx";
const HEATMAP_LEVEL_STYLES = [
    "var(--color-usage-heatmap-0)",
    "var(--color-usage-heatmap-1)",
    "var(--color-usage-heatmap-2)",
    "var(--color-usage-heatmap-3)",
    "var(--color-usage-heatmap-4)",
];
function getHeatmapCellStyle(level) {
    return {
        backgroundColor: HEATMAP_LEVEL_STYLES[level] ?? HEATMAP_LEVEL_STYLES[0],
    };
}
export function HeatmapColumn({ column, mode, }) {
    const node = (<div className={cn("flex min-w-0 flex-col gap-1", mode !== "daily" && "group/usage-heatmap-column")}>
      {column.cells.map((cell) => (<HeatmapCell key={cell.key} cell={cell}/>))}
    </div>);
    if (!column.tooltipTitle) {
        return node;
    }
    return <ControlHintTooltip title={column.tooltipTitle}>{node}</ControlHintTooltip>;
}
function HeatmapCell({ cell }) {
    const node = (<div className={cn("aspect-square w-full min-w-0 rounded-[4px] border transition-transform hover:scale-110 hover:border-border-hover", cell.hasUsage ? "border-border" : "border-transparent", cell.columnHover && "group-hover/usage-heatmap-column:border-border-hover")} style={getHeatmapCellStyle(cell.level)}/>);
    if (cell.tooltipTitle) {
        return <ControlHintTooltip title={cell.tooltipTitle}>{node}</ControlHintTooltip>;
    }
    return node;
}
