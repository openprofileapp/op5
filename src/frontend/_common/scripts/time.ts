export function formatRemainingTime(remainingMs: number) {
    if (remainingMs <= 0) return "";

    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s left`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s left`;
    }

    return `${seconds}s left`;
};

export function getRemainingTimeIcon(timeText: string) {
    if (!timeText || timeText === "Indefinitely") return "󰂛";

    if (timeText.includes("h")) {
        const hours = parseInt(timeText, 10);

        if (hours >= 24) return "󱑊";
        if (hours >= 23) return "󱑉";
        if (hours >= 22) return "󱑈";
        if (hours >= 21) return "󱑇";
        if (hours >= 20) return "󱑆";
        if (hours >= 19) return "󱑅";
        if (hours >= 18) return "󱑄";
        if (hours >= 17) return "󱑃";
        if (hours >= 16) return "󱑂";
        if (hours >= 15) return "󱑁";
        if (hours >= 14) return "󱑀";
        if (hours >= 13) return "󱐿";
        if (hours >= 12) return "󱑊";
        if (hours >= 11) return "󱑉";
        if (hours >= 10) return "󱑈";
        if (hours >= 9)  return "󱑇";
        if (hours >= 8)  return "󱑆";
        if (hours >= 7)  return "󱑅";
        if (hours >= 6)  return "󱑄";
        if (hours >= 5)  return "󱑃";
        if (hours >= 4)  return "󱑂";
        if (hours >= 3)  return "󱑁";
        if (hours >= 2)  return "󱑀";
        if (hours >= 1)  return "󱐿";
    }

    return "󱑊";
}
