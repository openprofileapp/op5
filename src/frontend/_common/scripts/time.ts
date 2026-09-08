import { DateTime } from "luxon";

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

export function formatLongRelative(date: string | number | Date) {
    if (!date) return "0 seconds ago";

    const past = new Date(date);
    if (isNaN(past.getTime())) return "0 seconds ago";

    const now = new Date();
    const diffMs = now.getTime() - past.getTime();

    if (diffMs <= 0) return "0 seconds ago";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years} year${years !== 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months !== 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    if (seconds > 0) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;

    return "0 seconds ago";
}

export function formatShortRelative(dateInput?: string | number | Date): string {
    if (!dateInput) return "N/A";

    let dt: DateTime;

    if (typeof dateInput === "number") {
        dt = DateTime.fromMillis(dateInput);
    } else if (typeof dateInput === "string") {
        dt = DateTime.fromISO(dateInput);
    } else {
        dt = DateTime.fromJSDate(dateInput);
    }

    dt = dt.toLocal();

    if (!dt.isValid) return "N/A";

    const now = DateTime.now();
    const diffHours = Math.abs(now.diff(dt, "hours").hours);

    if (diffHours < 48) {
        return dt.toRelative({ style: "short" }) ?? "0 seconds ago";
    }

    return dt.toFormat("LLLL d, yyyy");
}

export function isBirthdayToday(dateInput?: string | number | Date): boolean {
    if (!dateInput) return false;

    let dt: DateTime;

    if (typeof dateInput === "number") {
        dt = DateTime.fromMillis(dateInput);
    } else if (typeof dateInput === "string") {
        dt = DateTime.fromISO(dateInput);
    } else {
        dt = DateTime.fromJSDate(dateInput);
    }

    dt = dt.toLocal();

    if (!dt.isValid) return false;

    const now = DateTime.now();
    return dt.month === now.month && dt.day === now.day;
}
