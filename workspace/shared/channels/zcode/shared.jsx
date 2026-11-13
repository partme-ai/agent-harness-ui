// Imported ZCode UI: BotsDialog/shared.tsx @ 29628c9acdb81b703bbd4080c207a0e7ce5e276e. Apache-2.0.
import { Bot, Webhook } from '../bots_bridge.jsx';
import { ALL_BOT_WORKSPACES, BOT_BIND_CODE_TTL_MS } from '../bots_bridge.jsx';
import { DingDingChannelIcon, DiscordChannelIcon, FeishuChannelIcon, TelegramChannelIcon, WeComChannelIcon, WeixinChannelIcon, } from '../bots_bridge.jsx';
import { cn } from '../bots_bridge.jsx';
export const BIND_CODE_TTL_MS = BOT_BIND_CODE_TTL_MS;
export const TELEGRAM_BOTFATHER_URL = "https://t.me/BotFather";
export function isAllWorkspacesAllowed(allowedWorkspaces) {
    return (allowedWorkspaces.length === 0 ||
        allowedWorkspaces.includes(ALL_BOT_WORKSPACES));
}
export function formatBotDisplayName(name, fallbackName) {
    return name.trim() || fallbackName;
}
export function ProviderIcon({ provider, className, }) {
    const iconSrc = provider === "telegram"
        ? TelegramChannelIcon
        : provider === "weixin"
            ? WeixinChannelIcon
            : provider === "feishu" || provider === "lark"
                ? FeishuChannelIcon
                : provider === "dingding"
                    ? DingDingChannelIcon
                    : provider === "discord"
                        ? DiscordChannelIcon
                        : provider === "wecom"
                            ? WeComChannelIcon
                            : null;
    if (iconSrc) {
        return (<img src={iconSrc} alt="" aria-hidden="true" className={cn("size-4 object-contain", className)}/>);
    }
    if (provider === "webhook") {
        return <Webhook className={cn("size-4", className)}/>;
    }
    return <Bot className={cn("size-4", className)}/>;
}
export function runtimeText(runtime, enabled, formatRuntimeMessage) {
    if (runtime?.messageId && formatRuntimeMessage) {
        return formatRuntimeMessage(runtime.messageId);
    }
    return (runtime?.message ?? runtime?.status ?? (enabled ? "enabled" : "disabled"));
}
export function runtimeDot(runtime, enabled) {
    if (runtime?.status === "error")
        return "bg-destructive";
    if (runtime?.status === "polling" || runtime?.status === "connected")
        return "bg-success";
    if (enabled)
        return "bg-foreground-subtle";
    return "bg-border";
}
export function formatBindCountdown(ms) {
    return `${Math.max(0, Math.ceil(ms / 1000))}s`;
}
export function createDefaultCommands() {
    return {
        status: true,
        new: true,
        workspace: true,
        model: true,
        mode: true,
        thoughtLevel: true,
        reply: true,
    };
}
